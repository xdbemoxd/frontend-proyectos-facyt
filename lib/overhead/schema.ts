import { z } from "zod";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Elige una fecha.");

export const closePeriodSchema = z
  .object({
    start_date: date,
    end_date: date,
    criterion: z.enum(["proporcional", "equitativo"], { message: "Elige un criterio." }),
    // Se mantiene como string: evita perder centavos al serializar floats.
    total_cost: z
      .string()
      .trim()
      .regex(/^\d+(\.\d{1,2})?$/, "Escribe un monto con máximo 2 decimales.")
      .refine((v) => Number(v) > 0, "El costo total debe ser mayor que 0.")
      .refine((v) => Number(v) <= 999_999_999_999.99, "Número demasiado grande."),
  })
  .strict()
  .refine((d) => d.end_date >= d.start_date, {
    path: ["end_date"],
    message: "La fecha de fin no puede ser anterior al inicio.",
  });

export type ClosePeriodErrors = Partial<Record<"start_date" | "end_date" | "criterion" | "total_cost", string>>;

/** Query de GET /overhead/preview, validada también en el BFF. */
export const overheadPreviewQuerySchema = z
  .object({
    start_date: date,
    end_date: date,
    total_cost: z.string().regex(/^\d+(\.\d{1,2})?$/, "Monto inválido."),
    criterion: z.enum(["proporcional", "equitativo"]),
  })
  .strict()
  .refine((d) => d.end_date >= d.start_date, {
    path: ["end_date"],
    message: "La fecha de fin no puede ser anterior al inicio.",
  });
