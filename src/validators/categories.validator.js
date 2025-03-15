import { z } from "zod";
import prisma from "../prisma/prismaClient.js";

export const createCategoryValidator = z.object({
    body: z.object({
      name: z
        .string()
        .min(1, { message: "Il nome della categoria è obbligatorio" })
        .refine(
          async (name) => {
            const existingCategory = await prisma.category.findUnique({
              where: { name },
            });
            return !existingCategory; // Restituisce false se la categoria esiste già
          },
          {
            message: "Una categoria con questo nome esiste già",
          }
        ),
    }),
  });