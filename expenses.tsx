import { useState } from 'react';
import { Download, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateCloudSpendExpense, useDeleteCloudSpendExpense, useListCloudSpendExpenses, useUpdateCloudSpendExpense, getListCloudSpendExpensesQueryKey, getGetCloudSpendDashboardQueryKey, getGetCloudSpendUserQueryKey, type CloudSpendExpense } from '@workspace/api-client-react';
import { AppShell, getUsername, PageHeader } from '@/components/app-shell';
import { categories, ExpenseDialog, type ExpenseForm } from '@/components/expense-dialog';

const money = (value = 0) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const dateLabel = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

export default function Expenses() {
  const username = getUsername();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CloudSpendExpense | null>(null);
  const [notice, setNotice] = useState('');
  const params = { username, ...(category !== 'all' ? { category } : {}), ...(search.trim() ? { search: search.trim() } : {}) };
  const expensesQuery = useListCloudSpendExpenses(params, { query: { queryKey: getListCloudSpendExpensesQueryKey(params) } });
  const createExpense = useCreateCloudSpendExpense();
  const updateExpense = useUpdateCloudSpendExpense();
  const deleteExpense = useDeleteCloudSpendExpense();
  const busy = createExpense.isPending || updateExpense.isPending;
  function refresh() {
    queryClient.invalidateQueries({ queryKey: getListCloudSpendExpensesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetCloudSpendDashboardQueryKey(username) });
    queryClient.invalidateQueries({ queryKey: getGetCloudSpendUserQueryKey(username) });
  }
  function submit(form: ExpenseForm) {
    const data = { amount: Number(form.amount), category: form.category, description: form.description, date: form.date, paymentMethod: form.paymentMethod };
    if (editing) updateExpense.mutate({ expenseId: editing.id, data }, { onSuccess: () => { setDialogOpen(false); setEditing(null); setNotice('Expense updated'); refresh(); } });
    else createExpense.mutate({ data: { ...data, username } }, { onSuccess: () => { setDialogOpen(false); setNotice('Expense added'); refresh(); } });
  }
  function remove(expense: CloudSpendExpense) {
    if (!window.confirm(`Delete “${expense.description}”?`)) return;
    deleteExpense.mutate({ expenseId: expense.id }, { onSuccess: () => { setNotice('Expense deleted'); refresh(); } });
  }
  function exportCsv() {
    const rows = expensesQuery.data ?? [];
    if (!rows.length) return;
    const headers = ['Description', 'Category', 'Amount', 'Date', 'Payment method'];
    const escapeCsv = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
    const csv = [
      headers.map(escapeCsv).join(','),
      ...rows.map((expense) => [
        expense.description,
        expense.category,
        expense.amount.toFixed(2),
        expense.date,
        expense.paymentMethod,
      ].map(escapeCsv).join(',')),
    ].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `cloudspend-expenses-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setNotice(`Exported ${rows.length} ${rows.length === 1 ? 'expense' : 'expenses'}`);
  }
  const openAdd = () => { setEditing(null); setDialogOpen(true); };
  return <AppShell><PageHeader eyebrow="Your records" title="Expenses" description="A simple, searchable record of every money moment." action={<div className="flex flex-wrap items-center gap-2"><button type="button" data-testid="button-export-expenses" disabled={!expensesQuery.data?.length} onClick={exportCsv} className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-bold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-45"><Download className="h-4 w-4" /> Export CSV</button><button type="button" data-testid="button-add-expense" onClick={openAdd} className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"><Plus className="h-4 w-4" /> Add expense</button></div>} />
    {notice && <div data-testid="status-expense-success" className="page-enter mb-5 flex items-center justify-between rounded-xl border border-primary/20 bg-secondary px-4 py-3 text-sm font-bold text-secondary-foreground"><span>{notice}</span><button type="button" aria-label="Dismiss success" data-testid="button-dismiss-expense-success" onClick={() => setNotice('')}><X className="h-4 w-4" /></button></div>}
    <section className="rounded-2xl border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row"><label className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><input type="search" value={search} onChange={(e) => setSearch(e.target.value)} data-testid="input-search-expenses" className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-4 focus:ring-primary/15" placeholder="Search descriptions…" /></label><select value={category} onChange={(e) => setCategory(e.target.value)} data-testid="select-filter-category" className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-4 focus:ring-primary/15 sm:w-48"><option value="all">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></div>
      {expensesQuery.isLoading ? <div className="divide-y divide-border">{[1, 2, 3, 4].map((item) => <div key={item} className="flex items-center gap-4 p-5"><div className="skeleton h-10 w-10 rounded-xl" /><div className="flex-1"><div className="skeleton h-3 w-36 rounded" /><div className="skeleton mt-2 h-3 w-24 rounded" /></div><div className="skeleton h-4 w-16 rounded" /></div>)}</div> : expensesQuery.isError ? <div className="p-12 text-center"><p className="font-bold">Couldn’t load expenses.</p><p className="mt-1 text-sm text-muted-foreground">Try refreshing this list.</p><button type="button" data-testid="button-retry-expenses" onClick={() => expensesQuery.refetch()} className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Try again</button></div> : expensesQuery.data?.length ? <div className="divide-y divide-border">{expensesQuery.data.map((expense) => <div key={expense.id} data-testid={`row-expense-${expense.id}`} className="group flex items-center gap-3 p-4 transition-colors hover:bg-muted/40 sm:gap-5 sm:px-5"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-sm font-extrabold text-secondary-foreground">{expense.category.slice(0, 1)}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{expense.description}</p><p className="mt-1 text-xs text-muted-foreground">{expense.category} · {dateLabel(expense.date)} · {expense.paymentMethod}</p></div><span className="shrink-0 font-mono text-sm font-medium">{money(expense.amount)}</span><div className="flex shrink-0 gap-1 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100"><button type="button" aria-label={`Edit ${expense.description}`} data-testid={`button-edit-expense-${expense.id}`} onClick={() => { setEditing(expense); setDialogOpen(true); }} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-primary"><Pencil className="h-4 w-4" /></button><button type="button" aria-label={`Delete ${expense.description}`} data-testid={`button-delete-expense-${expense.id}`} onClick={() => remove(expense)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button></div></div>)}</div> : <div className="p-14 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-secondary-foreground"><Plus className="h-6 w-6" /></div><h2 className="mt-4 font-extrabold tracking-tight">{search || category !== 'all' ? 'No matching expenses' : 'Your list starts here'}</h2><p className="mx-auto mt-1 max-w-xs text-sm leading-6 text-muted-foreground">{search || category !== 'all' ? 'Try a different search or category.' : 'Add your first expense and CloudSpend will start giving your month shape.'}</p>{!search && category === 'all' && <button type="button" data-testid="button-empty-add-expense" onClick={openAdd} className="mt-5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">Add your first expense</button>}</div>}
    </section>
    <ExpenseDialog open={dialogOpen} expense={editing} username={username} pending={busy} onClose={() => { setDialogOpen(false); setEditing(null); }} onSubmit={submit} />
  </AppShell>;
}