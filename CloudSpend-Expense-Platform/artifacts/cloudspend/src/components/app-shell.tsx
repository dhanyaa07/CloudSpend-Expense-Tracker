import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { BarChart3, BellRing, Bot, ChevronRight, CircleDollarSign, FileBarChart, Lightbulb, LogOut, Menu, ReceiptText, Settings2, Sparkles, WalletCards, X } from 'lucide-react';
import { useClerk, useUser } from '@clerk/react';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: BarChart3 },
  { href: '/expenses', label: 'Expenses', icon: ReceiptText },
  { href: '/budget', label: 'Budget', icon: WalletCards },
  { href: '/insights', label: 'Insights', icon: Lightbulb },
  { href: '/copilot', label: 'Copilot', icon: Bot },
  { href: '/reports', label: 'Reports', icon: FileBarChart },
  { href: '/alerts', label: 'Alerts', icon: BellRing },
];

export function getUsername() {
  if (typeof window === 'undefined') return 'maya';
  return window.localStorage.getItem('cloudspend_username') || 'maya';
}

export function AppShell({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { signOut } = useClerk();
  const { user } = useUser();
  const username = getUsername();
  const displayName = user?.firstName || user?.username || 'there';
  const initials = (user?.firstName?.slice(0, 1) || username.slice(0, 2)).toUpperCase();

  function logout() {
    window.localStorage.removeItem('cloudspend_username');
    void signOut({ redirectUrl: '/' });
  }

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <button type="button" aria-label="Open menu" data-testid="button-open-menu" className="fixed right-4 top-4 z-30 rounded-xl border border-border bg-card p-2.5 shadow-sm md:hidden" onClick={() => setMobileOpen(true)}>
        <Menu className="h-5 w-5" />
      </button>
      {mobileOpen && <button type="button" aria-label="Close menu overlay" data-testid="button-close-menu-overlay" className="fixed inset-0 z-30 bg-slate-950/30 md:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col bg-sidebar px-4 py-5 text-sidebar-foreground transition-transform duration-300 md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-3 pb-8">
          <Link href="/dashboard" data-testid="link-brand" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground"><CircleDollarSign className="h-5 w-5" /></span>
            <span className="font-bold tracking-tight text-white">CloudSpend</span>
          </Link>
          <button type="button" aria-label="Close menu" data-testid="button-close-menu" className="rounded-lg p-1 text-sidebar-foreground/70 hover:bg-sidebar-accent md:hidden" onClick={() => setMobileOpen(false)}><X className="h-4 w-4" /></button>
        </div>
        <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/45">Your money, clearer</p>
        <nav className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = location === href;
            return <Link key={href} href={href} data-testid={`link-nav-${label.toLowerCase()}`} className={`group flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${active ? 'bg-sidebar-accent text-white' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-white'}`} onClick={() => setMobileOpen(false)}>
              <span className="flex items-center gap-3"><Icon className={`h-[18px] w-[18px] ${active ? 'text-sidebar-primary' : ''}`} />{label}</span>
              {active && <ChevronRight className="h-4 w-4 text-sidebar-primary" />}
            </Link>;
          })}
        </nav>
        <div className="mt-auto space-y-2">
          <div className="rounded-2xl border border-sidebar-border bg-sidebar-accent/40 p-3">
            <div className="mb-2 flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-sidebar-primary text-xs font-extrabold text-sidebar-primary-foreground">{initials}</span>
              <div className="min-w-0"><p className="truncate text-sm font-bold text-white" data-testid="text-sidebar-username">{displayName}</p><p className="truncate text-xs text-sidebar-foreground/55">{user?.primaryEmailAddress?.emailAddress || 'Personal account'}</p></div>
            </div>
            <button type="button" data-testid="button-settings" onClick={() => setLocation('/alerts')} className="flex w-full items-center gap-2 rounded-lg px-1 py-1.5 text-xs text-sidebar-foreground/60 hover:text-white"><Settings2 className="h-3.5 w-3.5" />Preferences</button>
          </div>
          <button type="button" data-testid="button-logout" onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-white"><LogOut className="h-4 w-4" />Sign out</button>
        </div>
      </aside>
      <main className="min-h-[100dvh] md:pl-[248px]">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-6 sm:px-8 lg:px-12 lg:py-10">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <header className="page-enter mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
    <div><p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p><h1 className="text-3xl font-extrabold tracking-[-0.04em] text-foreground sm:text-4xl">{title}</h1><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p></div>
    {action}
  </header>;
}

export function StatSkeleton() {
  return <div className="h-32 rounded-2xl border border-border bg-card p-5"><div className="skeleton h-3 w-20 rounded" /><div className="skeleton mt-5 h-8 w-28 rounded" /><div className="skeleton mt-3 h-3 w-32 rounded" /></div>;
}