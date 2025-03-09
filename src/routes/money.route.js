import express from "express";
import prisma from "../prisma/prismaClient.js";

const transactionRouter = express.Router();

// POST - Creazione transazione
transactionRouter.post('/transaction', async (req, res) => {
    const { description, date, amount, categoryId } = req.body;

    if (!categoryId) {
        return res.status(400).json({ message: 'categoryId è obbligatorio' });
    }

    const validDate = new Date(date);
    if (isNaN(validDate.getTime())) {
        return res.status(400).json({ message: 'Data non valida' });
    }

    try {
        const newTransaction = await prisma.transaction.create({
            data: {
                description,
                date: validDate,
                amount,
                type: amount < 0 ? "expense" : "income",
                category: { connect: { id: categoryId } }
            },
            include: { category: true }
        });

        res.json(newTransaction);
    } catch (error) {
        console.error("Errore:", error);
        res.status(500).json({ message: 'Errore nella creazione del record!' });
    }
});


// GET - Recupera transazione per ID
transactionRouter.get('/transaction/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const transaction = await prisma.transaction.findUnique({
            where: { id: Number(id) },
            include: { category: true }
        });

        if (!transaction) {
            return res.status(404).json({ message: 'Transazione non trovata!' });
        }

        res.json(transaction);
    } catch (error) {
        res.status(500).json({ message: 'Errore nel recupero della transazione!' });
    }
});

// GET - Filtra per mese/anno/tipo
transactionRouter.get('/transaction', async (req, res) => {
    const { month, year, type } = req.query;

    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    try {
        const transactions = await prisma.transaction.findMany({
            where: {
                date: {
                    gte: new Date(currentYear, currentMonth - 1, 1),
                    lt: new Date(currentYear, currentMonth, 1),
                },
                type: type || undefined
            },
            include: { category: true },
            orderBy: { date: 'asc' }
        });

        res.json(transactions);
    } catch (error) {
        console.error("Errore:", error);
        res.status(500).json({ message: 'Errore nel caricamento delle transazioni!' });
    }
});

// PUT - Aggiorna transazione
transactionRouter.put('/transaction/:id', async (req, res) => {
    const { id } = req.params;
    const { description, date, amount, categoryId } = req.body;

    if (!description || isNaN(amount)) {
        return res.status(400).json({ message: 'Dati mancanti o non validi' });
    }

    const validDate = date ? new Date(date) : undefined;
    if (validDate && isNaN(validDate.getTime())) {
        return res.status(400).json({ message: 'Data non valida' });
    }

    try {
        const updatedTransaction = await prisma.transaction.update({
            where: { id: Number(id) },
            data: {
                description,
                date: validDate || undefined,
                amount,
                type: amount < 0 ? "expense" : "income",
                category: categoryId
                    ? { connect: { id: Number(categoryId) } }
                    : undefined
            },
            include: { category: true }
        });

        res.json(updatedTransaction);
    } catch (error) {
        console.error("Errore aggiornamento:", error);
        res.status(500).json({ message: 'Errore durante l\'aggiornamento della transazione!' });
    }
});

// DELETE - Elimina transazione
transactionRouter.delete('/transaction/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedTransaction = await prisma.transaction.delete({
            where: { id: Number(id) }
        });

        res.json({ message: 'Transazione eliminata con successo!', data: deletedTransaction });
    } catch (error) {
        console.error("Errore eliminazione:", error);
        res.status(500).json({ message: 'Errore durante l\'eliminazione della transazione!' });
    }
});

export default transactionRouter;
