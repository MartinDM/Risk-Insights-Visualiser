import { FilterFn } from '@tanstack/react-table';
import { z } from 'zod';
import { Person } from './types/person';
export const FormSchema = z.object({
  dob: z
    .object({
      from: z.date().optional(),
      to: z.date().optional(),
    })
    .refine(
      (data) => {
        if (data.from && data.to) {
          return data.from <= data.to;
        }
        return true;
      },
      {
        message: 'From date must be before To date',
      },
    ),
});

export const dateRangeFilter: FilterFn<Person> = (row, columnId, filterValue) => {
  const value = row.getValue<Date | string>(columnId);
  if (!filterValue?.from || !filterValue?.to || !value) return true;

  const asDate = value instanceof Date ? value : new Date(value); // adjust parsing as needed
  const from = new Date(filterValue.from);
  const to = new Date(filterValue.to);
  // Normalize to ignore time
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);
  return asDate >= from && asDate <= to;
};
