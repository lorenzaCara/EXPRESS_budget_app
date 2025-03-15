import { z } from "zod";
import prisma from "../prisma/prismaClient.js";

const bodyUpsertSchema = z.object({
  description: z.string().min(1, { message: "Description è richiesta" }),
  date: z.coerce.date({
    required_error: "La data è obbligatoria",
    invalid_type_error: "Formato data non valido",
  }), //z.string().dateTime()
  amount: z.number().refine((val) => val !== 0, {
    message: "L'importo non può essere zero",
  }),
  type: z.enum(["income", "expense"]), // Accetta solo "income" o "expense"
  categoryId: z.number().int().positive().nullable(), // Può essere null oppure un numero intero positivo
});

export const createTransactionValidator = z.object({
  body: bodyUpsertSchema,
});

export const updateTransactionValidator = (partial = false) =>
  z
    .object({
      body: partial ? bodyUpsertSchema.partial() : bodyUpsertSchema,
      params: z.object({
        id: z.string(),
      }),
    })
    .superRefine(async ({ params }, ctx) => {
      const transactionExists = await prisma.transaction.findUnique({
        where: { id: Number(params.id) },
      });

      if (!transactionExists) {
        ctx.addIssue({
          path: ["params", "id"],
          message: "La transazione non esiste",
        });
      }
    });


