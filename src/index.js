import express from "express";
import moneyRouter from "./routes/money.route.js";
import cors from 'cors';

const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    methods: '*'
}));
// Middleware per il parsing del JSON
app.use(express.json());
app.use(moneyRouter);

// Route di test
app.get("/", (req, res) => {
  res.json({ message: "Server funzionante!" });
});

// Avvio del server
app.listen(PORT, () => {
  console.log(`Server in esecuzione sulla porta ${PORT}`);
});