import express from "express";
import categoriesRouter from "./routes/categories.route.js";
import cors from 'cors';
import prisma from "./prisma/prismaClient.js";
import transactionsRouter from "./routes/transactions.route.js";

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    methods: '*'
}));

app.use(express.json());

app.use(transactionsRouter);
app.use(categoriesRouter);

const ensureDefaultCategoryExists = async () => {
  const defaultCategory = await prisma.category.findUnique({
    where: { name: "Uncategorized" },
  });

  if (!defaultCategory) {
    await prisma.category.create({
      data: { name: "Uncategorized" },
    });
  }
};

// Chiamala quando il server parte
ensureDefaultCategoryExists();


app.get("/", (req, res) => {
  res.json({ message: "Server funzionante!" });
});

app.listen(PORT, () => {
  console.log(`Server in esecuzione sulla porta ${PORT}`);
});
