import { z } from "zod";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Elige una fecha.");

export const closePeriodSchema = z
  .object({
    start_date: date,
    end_date: date,
    criterion: z.enum(["proporcional", "equitativo"], { message: "Elige un criterio." }),
    total_cost: z.coerce
      .number({ message: "Escribe un número." })
      .gt(0, "El costo total debe ser mayor que 0.")
      .max(999_999_999_999.99, "Número demasiado grande."),
  })
  .refine((d) => d.end_date >= d.start_date, {
    path: ["end_date"],
    message: "La fecha de fin no puede ser anterior al inicio.",
  });

export type ClosePeriodErrors = Partial<Record<"start_date" | "end_date" | "criterion" | "total_cost", string>>;
