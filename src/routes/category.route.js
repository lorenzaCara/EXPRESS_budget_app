import express from "express";
import prisma from "../prisma/prismaClient.js";

const categoryRouter = express.Router();

// POST - Crea una nuova categoria
categoryRouter.post('/category', async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Il nome della categoria è obbligatorio" });
    }

    try {
        const newCategory = await prisma.category.create({
            data: { name }
        });

        res.json(newCategory);
    } catch (error) {
        console.error("Errore creazione categoria:", error);
        res.status(500).json({ message: "Errore nella creazione della categoria!" });
    }
});

// GET - Recupera tutte le categorie
categoryRouter.get('/category', async (req, res) => {
    try {
        const categories = await prisma.category.findMany();
        res.json(categories);
    } catch (error) {
        console.error("Errore nel recupero categorie:", error);
        res.status(500).json({ message: "Errore nel recupero delle categorie!" });
    }
});

// PUT - Aggiorna una categoria
categoryRouter.put('/category/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Il nome della categoria è obbligatorio" });
    }

    try {
        const updatedCategory = await prisma.category.update({
            where: { id: Number(id) },
            data: { name }
        });

        res.json(updatedCategory);
    } catch (error) {
        console.error("Errore aggiornamento categoria:", error);
        res.status(500).json({ message: "Errore nell'aggiornamento della categoria!" });
    }
});

//DELETE - Elimina una categoria
categoryRouter.delete('/category/:id', async (req, res) => {
    const { id } = req.params;

    try {
        let defaultCategory = await prisma.category.findUnique({
            where: { name: 'Non assegnato' } 
        });

        if (!defaultCategory) {
            defaultCategory = await prisma.category.create({
                data: { name: 'Non assegnato' }
            });
        }

        await prisma.transaction.updateMany({
            where: { categoryId: Number(id) },
            data: { categoryId: defaultCategory.id }
        });

        const deletedCategory = await prisma.category.delete({
            where: { id: Number(id) }
        });

        res.json({ message: 'Categoria eliminata con successo, transazioni spostate!', data: deletedCategory });
    } catch (error) {
        console.error("Errore eliminazione:", error);
        res.status(500).json({ message: 'Errore durante l\'eliminazione della categoria!' });
    }
});

export default categoryRouter;
