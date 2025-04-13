import { z } from 'zod'

export const formSchema = z
  .object({
    resolutionNumber: z.string().nonempty('Campo requerido').regex(/^\d*$/, {
      message: 'Solo se permiten números',
    }),
    fromNumber: z.string().nonempty('Campo requerido').regex(/^\d*$/, {
      message: 'Solo se permiten números',
    }),
    toNumber: z.string().nonempty('Campo requerido').regex(/^\d*$/, {
      message: 'Solo se permiten números',
    }),
    type: z.enum(['POS', 'ElectronicInvoice'], {
      required_error: 'Campo requerido',
    }),
    prefix: z.string().nonempty('Campo requerido').max(5, {
      message: 'Máximo 5 caracteres',
    }),

    dateRange: z
      .object({
        from: z.date().optional(),
        to: z.date().optional(),
      })
      .refine((data) => !!data.from && !!data.to, {
        message: 'Ambas fechas son requeridas',
        path: [],
      })
      .refine((data) => data.from && data.to && data.to >= data.to, {
        message: 'La fecha final debe ser igual o posterior a la inicial',
        path: [],
      }),
  })
  .refine(
    (data) => {
      const from = parseInt(data.fromNumber)
      const to = parseInt(data.toNumber)
      return to > from
    },
    {
      message: 'Este valor debe ser mayor al valor inicial',
      path: ['toNumber'], // Asocia el error al campo toNumber
    },
  )
