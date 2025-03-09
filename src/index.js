import express from "express";
import moneyRouter from "./routes/money.route.js";
import categoryRouter from "./routes/category.route.js"; 
import cors from 'cors';

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    methods: '*'
}));

app.use(express.json());

app.use(moneyRouter);
app.use(categoryRouter);


app.get("/", (req, res) => {
  res.json({ message: "Server funzionante!" });
});

app.listen(PORT, () => {
  console.log(`Server in esecuzione sulla porta ${PORT}`);
});
