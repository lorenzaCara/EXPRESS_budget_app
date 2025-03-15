import validatorMiddleware from "../middleware/validator.middleware.js";
import prisma from "../prisma/prismaClient.js";
import express from "express";
import { createTransactionValidator, updateTransactionValidator } from "../validators/transactions.validator.js";

const transactionsRouter = express.Router();

// Get all transactions
transactionsRouter.get("/transactions", async (req, res) => {
  try {
    const {
      month: monthQuery = `${new Date().getFullYear()}-${
        new Date().getMonth() + 1
      }`,
    } = req.query;

    const [year, month] = monthQuery.split("-");
    const parsedMonth = parseInt(month) - 1;
    const parsedYear = parseInt(year);

    const transactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: new Date(parsedYear, parsedMonth, 1),
          lt: new Date(parsedYear, parsedMonth + 1, 1),
        },
      },
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single transaction
transactionsRouter.get("/transactions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await prisma.transaction.findUnique({
      where: { id: +id },
    });
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new transaction
transactionsRouter.post("/transactions",
  validatorMiddleware(createTransactionValidator),
  async (req, res) => {
  try {
    const { description, amount, date, categoryId } = req.body;

    let assignedCategoryId = categoryId ? +categoryId : null;

    // Se categoryId non è fornito, assegna la categoria "Uncategorized"
    if (!assignedCategoryId) {
      const defaultCategory = await prisma.category.findUnique({
        where: { name: "Uncategorized" },
      });

      // Se non esiste, la crea
      if (!defaultCategory) {
        const newCategory = await prisma.category.create({
          data: { name: "Uncategorized" },
        });
        assignedCategoryId = newCategory.id;
      } else {
        assignedCategoryId = defaultCategory.id;
      }
    }

    const transaction = await prisma.transaction.create({
      data: {
        description,
        amount,
        date,
        categoryId: assignedCategoryId,
        type: amount > 0 ? "income" : "expense",
      },
    });

    res.json(transaction);
  } catch (error) {
    console.error(error); // Aggiungi questo per vedere il dettaglio dell'errore
    res.status(500).json({ error: error.message });
  }
});


// Update a transaction
transactionsRouter.put("/transactions/:id",
  validatorMiddleware(updateTransactionValidator()),
  async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount, date, categoryId } = req.body;
    
    const transaction = await prisma.transaction.update({
      where: { id: +id },
      data: {
        description,
        amount,
        date,
        categoryId: categoryId ? +categoryId : null,
        type: amount > 0 ? "income" : "expense",
      },
    });
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a transaction
transactionsRouter.delete("/transactions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.transaction.delete({
      where: { id: +id },
    });
    res.json({ message: "Transaction deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default transactionsRouter;