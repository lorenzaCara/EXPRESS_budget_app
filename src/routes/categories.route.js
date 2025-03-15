import validatorMiddleware from "../middleware/validator.middleware.js";
import prisma from "../prisma/prismaClient.js";
import express from "express";
import { createCategoryValidator } from "../validators/categories.validator.js";

const categoriesRouter = express.Router();

// Get all categories
categoriesRouter.get("/categories", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single category
categoriesRouter.get("/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id: +id },
    });
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new category
categoriesRouter.post(
  "/categories",
  validatorMiddleware(createCategoryValidator),
  async (req, res) => {
    try {
      const { name } = req.body;

      if (name.toLowerCase() === "uncategorized") {
        return res.status(400).json({ error: "Cannot create another Uncategorized category" });
      }

      const category = await prisma.category.create({
        data: { name },
      });

      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Errore di validazione",
          issues: error.errors,
        });
      }

      res.status(500).json({ error: error.message });
    }
  }
);

// Update a category
categoriesRouter.put("/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const category = await prisma.category.update({
      where: { id: +id },
      data: { name },
    });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a category (but prevent deletion of Uncategorized)
categoriesRouter.delete("/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Trova la categoria per nome
    const category = await prisma.category.findUnique({
      where: { id: +id },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    if (category.name.toLowerCase() === "uncategorized") {
      return res.status(400).json({ error: "Cannot delete the Uncategorized category" });
    }

    await prisma.category.delete({
      where: { id: +id },
    });

    res.json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


export default categoriesRouter;