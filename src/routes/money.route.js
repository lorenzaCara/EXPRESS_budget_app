import express from "express";
import prisma from "../prisma/prismaClient.js";

const moneyRouter = express.Router();

//POST
moneyRouter.post('/money', async (req, res) => {
    const { description, date, amount, type } = req.body; 

    try {
        const newMoney = await prisma.money.create({
            data: {
                description,
                date: new Date(date),
                amount,
                type: type || "expense"
            }
        });
        res.json(newMoney);
    } catch (error) {
        console.error("Errore:", error);
        res.status(500).json({ message: 'Errore nella creazione del record!'});
    }
});


//GET
moneyRouter.get('/money/:id', async (req,res) => {
    const { id } = req.params;
    try {
        const transaction = await prisma.money.findUnique({
            where: { id: +id }
        })
        if (!transaction) {
            return res.status(404).json({message: 'not found!'});
        }
        res.json(transaction);
    } catch (error) {
        res.status(500).json({message: 'impossibile caricare la lista!'});
    }
})

//GET: Filtrare per Mese/Anno (default: Mese/Anno corrente)
moneyRouter.get('/money', async (req, res) => {
    const { month, year, type } = req.query;

    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1; 
    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    try {
        const transactions = await prisma.money.findMany({
            where: {
                date: {
                    gte: new Date(currentYear, currentMonth - 1, 1),
                    lt: new Date(currentYear, currentMonth, 1), 
                },
                type: type || undefined
            },
            orderBy: {
                date: 'asc'
            }
        });

        res.json(transactions);
    } catch (error) {
        console.error("Errore:", error);
        res.status(500).json({ message: 'Impossibile caricare le transazioni!'});
    }
});


//UPDATE
moneyRouter.put('/money/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const updatedMoney = await prisma.money.update({
            where: { id: Number(id) }, 
            data: { 
                description: req.body.description,
                date: req.body.date ? new Date(req.body.date) : undefined,
                amount: req.body.amount,
                type: req.body.type
            },
        });
        res.json(updatedMoney);
    } catch (error) {
        console.error('Errore durante l\'aggiornamento:', error);
        res.status(500).json({ message: 'Impossibile aggiornare il record!'});
    }
});
    
//DELETE
moneyRouter.delete('/money/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedMoney = await prisma.money.delete({
            where: { id: +id }
        });
        res.json({ message: 'Record eliminato con successo!', data: deletedMoney });
    } catch (error) {
        console.error("Errore:", error);
        res.status(500).json({ message: 'Impossibile eliminare il record!'});
    }
});

export default moneyRouter;

