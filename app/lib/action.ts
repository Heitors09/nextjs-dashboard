'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const formSchema = z.object({
  id: z.string(),
  costumerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

const CreateInvoice = formSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  const { costumerId, amount, status } = CreateInvoice.parse({
    costumerId: formData.get('costumerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  await sql`INSERT INTO INVOICES (costumer_id, amount, status, date)
       VALUES(${costumerId}, ${amountInCents}, ${status}, ${date})
      `;

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}
