import { useEffect, useState } from 'react';
import { Check, CircleHelp, PiggyBank, Save } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { getGetCloudSpendDashboardQueryKey, getGetCloudSpendUserQueryKey, useGetCloudSpendDashboard, useGetCloudSpendUser, useUpdateCloudSpendBudget } from '@workspace/api-client-react';
import { AppShell, getUsername, PageHeader } from '@/components/app-shell';
import { categories } from '@/components/expense-dialog';
import { SmartBudgetAlert } from '@/components/smart-budget-alert';

const money = (value = 0) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export default function Budget() {
  const username = getUsername();
  const queryClient = useQueryClient();
  const userQuery = useGetCloudSpendUser(username, { query: { queryKey: getGetCloudSpendUserQueryKey(username) } });
  const dashboardQuery = useGetCloudSpendDashboard(username, { query: { queryKey: getGetCloudSpendDashboardQueryKey(username) } });
  const updateBudget = useUpdateCloudSpendBudget();
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState('');
  useEffect(() => {
    if (userQuery.data) {
      setMonthlyBudget(String(userQuery.data.monthlyBudget ?? ''));
      setCategoryBudgets(Object.fromEntries(categories.map((item) => [item, String(userQuery.data.categoryBudgets?.[item] ?? '')])));
    }
  }, [userQuery.data]);
  function save() {
    const payload = { monthlyBudget: Number(monthlyBudget) || 0, categoryBudgets: Object.fromEntries(Object.entries(categoryBudgets).filter(([, value]) => value !== '').map(([key, value]) => [key, Number(value) || 0])) };
    updateBudget.mutate({ username, data: payload }, { onSuccess: (updated) => { setNotice('Budget saved'); queryClient.setQueryData(getGetCloudSpendUserQueryKey(username), updated); queryClient.invalidateQueries({ queryKey: getGetCloudSpendDashboardQueryKey(username) }); window.setTimeout(() => setNotice(''), 3500); } });
  }
  if (userQuery.isLoading) return <AppShell><PageHeader eyebrow="A little direction" title="Budget" description="Loading your plan…" /><div className="skeleton h-72 rounded-2xl" /></AppShell>;
  if (userQuery.isError || !userQuery.data) return <AppShell><div className="page-enter rounded-2xl border border-border bg-card p-12 text-center"><CircleHelp className="mx-auto h-8 w-8 text-destructive" /><h1 className="mt-4 text-xl font-extrabold">Budget is taking a break.</h1><button type="button" data-testid="button-retry-budget" onClick={() => userQuery.refetch()} className="mt-5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">Try again</button></div></AppShell>;
  return <AppShell><PageHeader eyebrow="A little direction" title="Budget" description="Give your money a few gentle guardrails. This is a plan, not a punishment." action={<button type="button" disabled={updateBudget.isPending} data-testid="button-save-budget" onClick={save} className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-60"><Save className="h-4 w-4" />{updateBudget.isPending ? 'Saving…' : 'Save budget'}</button>} />
    {notice && <div data-testid="status-budget-success" className="page-enter mb-5 flex items-center gap-2 rounded-xl border border-primary/20 bg-secondary px-4 py-3 text-sm font-bold text-secondary-foreground"><Check className="h-4 w-4 text-primary" /> {notice}</div>}
     {dashboardQuery.data && <div className="mb-5 page-enter"><SmartBudgetAlert monthlyBudget={userQuery.data.monthlyBudget} monthSpend={dashboardQuery.data.summary.monthSpend} categoryBudgets={userQuery.data.categoryBudgets} categoryBreakdown={dashboardQuery.data.categoryBreakdown} /></div>}
    <div className="grid gap-5 lg:grid-cols-[.82fr_1.18fr]">
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f6e9cd] text-[#9a681b]"><PiggyBank className="h-5 w-5" /></div><h2 className="mt-6 text-xl font-extrabold tracking-tight">Monthly intention</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">How much would you like to keep your spending within this month?</p><label className="mt-7 block"><span className="mb-2 block text-xs font-bold text-muted-foreground">Monthly budget</span><div className="relative"><span className="absolute left-4 top-3 font-mono text-lg text-muted-foreground">$</span><input type="number" min="0" step="1" value={monthlyBudget} onChange={(e) => setMonthlyBudget(e.target.value)} data-testid="input-monthly-budget" className="h-14 w-full rounded-2xl border border-input bg-background pl-9 pr-4 font-mono text-2xl outline-none focus:ring-4 focus:ring-primary/15" placeholder="0" /></div></label><div className="mt-7 rounded-2xl bg-muted p-4"><p className="text-xs font-bold text-muted-foreground">A useful starting point</p><p className="mt-2 text-sm leading-6 text-foreground">Set a number that gives you room for the unplanned things too. You can change it whenever your life changes.</p></div></section>
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8"><div className="flex items-start justify-between"><div><h2 className="text-xl font-extrabold tracking-tight">Category guardrails</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Optional limits for the places your money goes most often.</p></div><span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold text-secondary-foreground">Optional</span></div><div className="mt-7 grid gap-x-5 gap-y-4 sm:grid-cols-2">{categories.map((category) => <label key={category} className="block"><span className="mb-1.5 block text-xs font-bold text-muted-foreground">{category}</span><div className="relative"><span className="absolute left-3 top-2.5 font-mono text-sm text-muted-foreground">$</span><input type="number" min="0" step="1" value={categoryBudgets[category] ?? ''} onChange={(e) => setCategoryBudgets((current) => ({ ...current, [category]: e.target.value }))} data-testid={`input-category-budget-${category.toLowerCase().replace(/[^a-z]+/g, '-')}`} className="h-10 w-full rounded-xl border border-input bg-background pl-7 pr-3 font-mono text-sm outline-none focus:ring-4 focus:ring-primary/15" placeholder="No limit" /></div></label>)}</div></section>
    </div>
  </AppShell>;
}