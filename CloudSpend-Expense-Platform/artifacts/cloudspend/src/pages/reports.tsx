import { useMemo, useState } from 'react';
import { Download, FileBarChart, RefreshCw } from 'lucide-react';
import { useGetCloudSpendReports, getGetCloudSpendReportsQueryKey } from '@workspace/api-client-react';
import { AppShell, getUsername, PageHeader } from '@/components/app-shell';

const money = (value = 0) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function Reports() {
  const username = getUsername();
  const report = useGetCloudSpendReports(username, { query: { queryKey: getGetCloudSpendReportsQueryKey(username) } });
  const [notice, setNotice] = useState('');
  const data = report.data;
  const maxMonth = useMemo(() => Math.max(...(data?.monthly.map((item) => item.amount) ?? [1]), 1), [data]);

  function download(format: 'csv' | 'json') {
    if (!data) return;
    const content = format === 'json'
      ? JSON.stringify(data, null, 2)
      : [
          ['Description', 'Category', 'Amount', 'Date', 'Payment method'].join(','),
          ...data.expenses.map((expense) => [expense.description, expense.category, expense.amount.toFixed(2), expense.date, expense.paymentMethod].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')),
        ].join('\n');
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `cloudspend-report-${new Date().toISOString().slice(0, 10)}.${format}`;
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice(`Downloaded ${format.toUpperCase()} report`);
  }

  if (report.isLoading) return <AppShell><PageHeader eyebrow="Your data, portable" title="Reports" description="Building a clear export of your spending history." /><div className="skeleton h-96 rounded-2xl" /></AppShell>;
  if (report.isError || !data) return <AppShell><div className="page-enter flex min-h-[60vh] items-center justify-center text-center"><div><RefreshCw className="mx-auto h-8 w-8 text-destructive" /><h1 className="mt-4 text-xl font-extrabold">Reports are taking a break.</h1><button type="button" onClick={() => report.refetch()} className="mt-5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">Try again</button></div></div></AppShell>;

  return <AppShell>
    <PageHeader eyebrow="Your data, portable" title="Reports" description="A clean view of the trends behind your ledger, ready to take with you." action={<div className="flex gap-2"><button type="button" onClick={() => download('csv')} className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-bold hover:bg-muted"><Download className="h-4 w-4" /> CSV</button><button type="button" onClick={() => download('json')} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"><Download className="h-4 w-4" /> JSON</button></div>} />
    {notice && <div className="mb-5 rounded-xl border border-primary/20 bg-secondary px-4 py-3 text-sm font-bold text-secondary-foreground">{notice}</div>}
    <div className="grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs font-bold text-muted-foreground">Total tracked</p><p className="mt-3 font-mono text-3xl">{money(data.total)}</p></div><div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs font-bold text-muted-foreground">Transactions</p><p className="mt-3 font-mono text-3xl">{data.count}</p></div><div className="rounded-2xl border border-primary/20 bg-[#e2f2ec] p-5"><p className="text-xs font-bold text-[#286658]">Report generated</p><p className="mt-3 text-lg font-extrabold text-[#1f554b]">{new Date(data.generatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p></div></div>
    <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
      <section className="rounded-2xl border border-border bg-card p-6"><div className="flex items-start gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary"><FileBarChart className="h-5 w-5" /></span><div><h2 className="font-extrabold tracking-tight">Monthly movement</h2><p className="mt-1 text-xs text-muted-foreground">Total spending by calendar month</p></div></div>{data.monthly.length ? <div className="mt-8 space-y-4">{data.monthly.slice(-8).map((item) => <div key={item.month}><div className="mb-1.5 flex items-center justify-between text-xs"><span className="font-bold">{new Date(`${item.month}-01T12:00:00`).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span><span className="font-mono text-muted-foreground">{money(item.amount)}</span></div><div className="h-3 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.max(4, item.amount / maxMonth * 100)}%` }} /></div></div>)}</div> : <p className="mt-8 text-sm text-muted-foreground">Add expenses to create your first monthly report.</p>}</section>
      <section className="rounded-2xl border border-border bg-card p-6"><h2 className="font-extrabold tracking-tight">Category allocation</h2><p className="mt-1 text-xs text-muted-foreground">Where your lifetime spend has gone</p><div className="mt-7 space-y-4">{data.categories.slice(0, 7).map((item) => <div key={item.category} className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-bold">{item.category}</p><div className="mt-2 h-1.5 w-40 rounded-full bg-muted"><div className="h-full rounded-full bg-[#d8a34e]" style={{ width: `${data.total ? Math.max(3, item.amount / data.total * 100) : 0}%` }} /></div></div><span className="font-mono text-sm text-muted-foreground">{money(item.amount)}</span></div>)}</div></section>
    </div>
  </AppShell>;
}