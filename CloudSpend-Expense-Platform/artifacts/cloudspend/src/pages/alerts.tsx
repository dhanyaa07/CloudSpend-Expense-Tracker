import { useEffect, useState } from 'react';
import { BellRing, Check, Mail, MessageSquareText, Save, ShieldCheck } from 'lucide-react';
import { useUser } from '@clerk/react';
import { useGetCloudSpendAlerts, useUpdateCloudSpendAlerts, getGetCloudSpendAlertsQueryKey, getGetCloudSpendUserQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { AppShell, getUsername, PageHeader } from '@/components/app-shell';

export default function Alerts() {
  const username = getUsername();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const alerts = useGetCloudSpendAlerts(username, { query: { queryKey: getGetCloudSpendAlertsQueryKey(username) } });
  const update = useUpdateCloudSpendAlerts();
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [threshold, setThreshold] = useState('80');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!alerts.data?.settings) return;
    const settings = alerts.data.settings;
    setEmailEnabled(settings.emailAlertsEnabled);
    setSmsEnabled(settings.smsAlertsEnabled);
    setEmail(settings.alertEmail || user?.primaryEmailAddress?.emailAddress || '');
    setPhone(settings.alertPhone || '');
    setThreshold(String(settings.alertThreshold));
  }, [alerts.data, user]);

  function save() {
    update.mutate({ username, data: { emailAlertsEnabled: emailEnabled, smsAlertsEnabled: smsEnabled, alertEmail: email || null, alertPhone: phone || null, alertThreshold: Number(threshold) || 80 } }, { onSuccess: (saved) => { queryClient.setQueryData(getGetCloudSpendAlertsQueryKey(username), (current: typeof alerts.data | undefined) => current ? { ...current, settings: saved } : current); queryClient.setQueryData(getGetCloudSpendUserQueryKey(username), saved); setNotice('Alert preferences saved'); window.setTimeout(() => setNotice(''), 3500); } });
  }

  if (alerts.isLoading) return <AppShell><PageHeader eyebrow="Stay ahead of the month" title="Alerts" description="Loading your delivery preferences…" /><div className="skeleton h-80 rounded-2xl" /></AppShell>;
  const percentUsed = alerts.data?.percentUsed ?? 0;
  return <AppShell>
    <PageHeader eyebrow="Stay ahead of the month" title="Alerts" description="Choose when CloudSpend should nudge you before the plan gets away from you." action={<button type="button" onClick={save} disabled={update.isPending} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"><Save className="h-4 w-4" />{update.isPending ? 'Saving…' : 'Save preferences'}</button>} />
    {notice && <div className="mb-5 flex items-center gap-2 rounded-xl border border-primary/20 bg-secondary px-4 py-3 text-sm font-bold text-secondary-foreground"><Check className="h-4 w-4" />{notice}</div>}
    <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
      <section className="rounded-2xl border border-primary/20 bg-[#e2f2ec] p-6"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-[#286658]">This month</p><h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#1f554b]">{percentUsed}% used</h2></div><span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/60 text-[#286658]"><BellRing className="h-5 w-5" /></span></div><div className="mt-7 h-3 overflow-hidden rounded-full bg-[#bedccd]"><div className={`h-full rounded-full ${percentUsed >= 100 ? 'bg-[#b96258]' : 'bg-primary'}`} style={{ width: `${Math.min(100, percentUsed)}%` }} /></div><p className="mt-4 text-sm leading-6 text-[#48776d]">You’ll get a nudge when spending reaches {threshold}% of your monthly budget.</p></section>
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-7"><h2 className="font-extrabold tracking-tight">Delivery preferences</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">CloudSpend keeps these settings private and only uses them for your budget alerts.</p><label className="mt-7 flex items-start gap-3 rounded-2xl border border-border p-4"><input type="checkbox" checked={emailEnabled} onChange={(event) => setEmailEnabled(event.target.checked)} className="mt-1 h-4 w-4 accent-primary" /><span className="flex-1"><span className="flex items-center gap-2 text-sm font-bold"><Mail className="h-4 w-4 text-primary" /> Email alerts</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">A weekly summary and threshold warning in your inbox.</span>{emailEnabled && <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="mt-3 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-4 focus:ring-primary/15" />}</span></label><label className="mt-3 flex items-start gap-3 rounded-2xl border border-border p-4"><input type="checkbox" checked={smsEnabled} onChange={(event) => setSmsEnabled(event.target.checked)} className="mt-1 h-4 w-4 accent-primary" /><span className="flex-1"><span className="flex items-center gap-2 text-sm font-bold"><MessageSquareText className="h-4 w-4 text-primary" /> SMS alerts</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">A short nudge when your plan needs attention.</span>{smsEnabled && <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+91 98765 43210" className="mt-3 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-4 focus:ring-primary/15" />}</span></label><label className="mt-5 block"><span className="mb-2 block text-xs font-bold text-muted-foreground">Alert me at</span><div className="flex items-center gap-3"><input type="range" min="50" max="100" step="5" value={threshold} onChange={(event) => setThreshold(event.target.value)} className="flex-1 accent-primary" /><span className="w-12 text-right font-mono text-sm font-bold">{threshold}%</span></div></label></section>
    </div>
    <div className="mt-5 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 shrink-0 text-primary" /> Alerts are scoped to your signed-in account. Delivery providers can be connected when you’re ready to send email or SMS outside the app.</div>
  </AppShell>;
}