import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { CloudSpendExpense } from '@workspace/api-client-react';

export const categories = ['Housing', 'Food & drink', 'Transport', 'Shopping', 'Health', 'Learning', 'Fun', 'Other'];
export const paymentMethods = ['Debit card', 'Credit card', 'Bank transfer', 'Cash', 'Digital wallet'];

export type ExpenseForm = { amount: string; category: string; description: string; date: string; paymentMethod: string };

export function ExpenseDialog({ open, expense, username, pending, onClose, onSubmit }: { open: boolean; expense?: CloudSpendExpense | null; username: string; pending?: boolean; onClose: () => void; onSubmit: (data: ExpenseForm) => void }) {
  const [form, setForm] = useState<ExpenseForm>({ amount: '', category: 'Food & drink', description: '', date: new Date().toISOString().slice(0, 10), paymentMethod: 'Debit card' });
  useEffect(() => {
    if (expense) setForm({ amount: String(expense.amount), category: expense.category, description: expense.description, date: expense.date.slice(0, 10), paymentMethod: expense.paymentMethod });
    else setForm({ amount: '', category: 'Food & drink', description: '', date: new Date().toISOString().slice(0, 10), paymentMethod: 'Debit card' });
  }, [expense, open]);
  if (!open) return null;
  const set = (key: keyof ExpenseForm, value: string) => setForm((current) => ({ ...current, [key]: value }));
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 p-4" role="dialog" aria-modal="true" aria-label={expense ? 'Edit expense' : 'Add expense'}>
    <div className="page-enter w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl sm:p-8">
      <div className="mb-6 flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">{expense ? 'Refine the record' : 'New record'}</p><h2 className="mt-1 text-2xl font-extrabold tracking-tight">{expense ? 'Edit expense' : 'Add an expense'}</h2></div><button type="button" data-testid="button-close-expense-dialog" onClick={onClose} className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"><X className="h-5 w-5" /></button></div>
      <form onSubmit={(event) => { event.preventDefault(); onSubmit(form); }} className="space-y-4">
        <label className="block"><span className="mb-1.5 block text-xs font-bold text-muted-foreground">Amount</span><div className="relative"><span className="absolute left-3 top-2.5 font-mono text-muted-foreground">$</span><input required min="0.01" step="0.01" type="number" value={form.amount} onChange={(e) => set('amount', e.target.value)} data-testid="input-expense-amount" className="h-11 w-full rounded-xl border border-input bg-background pl-8 pr-3 font-mono text-sm outline-none ring-primary/20 focus:ring-4" placeholder="0.00" /></div></label>
        <label className="block"><span className="mb-1.5 block text-xs font-bold text-muted-foreground">What was it for?</span><input required minLength={1} value={form.description} onChange={(e) => set('description', e.target.value)} data-testid="input-expense-description" className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-4 focus:ring-primary/20" placeholder="A useful description" /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block"><span className="mb-1.5 block text-xs font-bold text-muted-foreground">Category</span><select value={form.category} onChange={(e) => set('category', e.target.value)} data-testid="select-expense-category" className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-4 focus:ring-primary/20">{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
          <label className="block"><span className="mb-1.5 block text-xs font-bold text-muted-foreground">Date</span><input required type="date" value={form.date} onChange={(e) => set('date', e.target.value)} data-testid="input-expense-date" className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-4 focus:ring-primary/20" /></label>
        </div>
        <label className="block"><span className="mb-1.5 block text-xs font-bold text-muted-foreground">Paid with</span><select value={form.paymentMethod} onChange={(e) => set('paymentMethod', e.target.value)} data-testid="select-expense-payment-method" className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-4 focus:ring-primary/20">{paymentMethods.map((method) => <option key={method}>{method}</option>)}</select></label>
        <div className="flex justify-end gap-3 pt-3"><button type="button" data-testid="button-cancel-expense" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-bold text-muted-foreground hover:bg-muted">Cancel</button><button disabled={pending} type="submit" data-testid="button-save-expense" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-60">{pending ? 'Saving…' : expense ? 'Save changes' : 'Add expense'}</button></div>
      </form>
    </div>
  </div>;
}