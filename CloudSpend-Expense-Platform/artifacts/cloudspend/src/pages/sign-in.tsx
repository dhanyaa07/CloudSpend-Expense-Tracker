import { useState } from 'react';
import { ArrowRight, Check, CircleDollarSign, ShieldCheck, Sparkles } from 'lucide-react';
import { useLocation } from 'wouter';

export default function SignIn() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  function enter(value: string) {
    const clean = value.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
    if (clean.length < 2) { setError('Use at least two letters to continue.'); return; }
    window.localStorage.setItem('cloudspend_username', clean);
    setLocation('/dashboard');
  }
  return <main className="min-h-[100dvh] overflow-hidden bg-[#eaf2f3] text-[#20343c]">
    <div className="mx-auto grid min-h-[100dvh] max-w-[1480px] lg:grid-cols-[1.08fr_.92fr]">
      <section className="relative hidden overflow-hidden bg-[#17333d] p-10 text-[#edf5f1] lg:flex lg:flex-col lg:justify-between lg:p-16">
        <div className="absolute -right-28 top-28 h-80 w-80 rounded-full border-[36px] border-[#a6d8c6]/15" /><div className="absolute -bottom-24 -left-20 h-96 w-96 rounded-full border-[52px] border-[#d8a34e]/15" />
        <div className="relative flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#a6d8c6] text-[#17333d]"><CircleDollarSign className="h-5 w-5" /></span><span className="text-lg font-extrabold tracking-tight">CloudSpend</span></div>
        <div className="relative max-w-lg"><p className="mb-6 text-[11px] font-bold uppercase tracking-[0.2em] text-[#a6d8c6]">A better relationship with money</p><h1 className="text-6xl font-extrabold leading-[.98] tracking-[-0.06em]">Make space for what matters.</h1><p className="mt-7 max-w-md text-base leading-7 text-[#bed0d0]">A calm place to see your spending, set a direction, and keep moving without the spreadsheet energy.</p><div className="mt-12 grid grid-cols-2 gap-3"><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><Sparkles className="mb-8 h-5 w-5 text-[#d8a34e]" /><p className="text-sm font-bold">See the signal</p><p className="mt-1 text-xs leading-5 text-[#bed0d0]">Know where your money is going.</p></div><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><ShieldCheck className="mb-8 h-5 w-5 text-[#a6d8c6]" /><p className="text-sm font-bold">Stay in control</p><p className="mt-1 text-xs leading-5 text-[#bed0d0]">Build habits that feel like yours.</p></div></div></div>
        <p className="relative text-xs text-[#bed0d0]/65">Private by default. No judgment attached.</p>
      </section>
      <section className="flex items-center justify-center p-6 sm:p-12"><div className="w-full max-w-md">
        <div className="mb-12 flex items-center gap-3 lg:hidden"><span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground"><CircleDollarSign className="h-5 w-5" /></span><span className="text-lg font-extrabold tracking-tight">CloudSpend</span></div>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Welcome back</p><h2 className="text-4xl font-extrabold tracking-[-0.05em]">Start with your name.</h2><p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">Your personal space is ready when you are. Pick a name you’ll recognize.</p>
        <form onSubmit={(e) => { e.preventDefault(); enter(username); }} className="mt-9"><label className="mb-2 block text-xs font-bold text-foreground">Your username</label><input autoFocus required value={username} onChange={(e) => { setUsername(e.target.value); setError(''); }} data-testid="input-username" className="h-13 w-full rounded-2xl border border-input bg-card px-4 text-base outline-none transition-shadow focus:ring-4 focus:ring-primary/15" placeholder="e.g. alex" />{error && <p data-testid="status-signin-error" className="mt-2 text-xs font-semibold text-destructive">{error}</p>}<button type="submit" data-testid="button-enter-cloudspend" className="mt-4 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-[0_8px_20px_-10px_hsl(var(--primary))] transition-transform hover:-translate-y-0.5">Enter CloudSpend <ArrowRight className="h-4 w-4" /></button></form>
        <button type="button" data-testid="button-try-demo" onClick={() => enter('maya')} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 text-sm font-bold text-foreground transition-colors hover:border-primary/40 hover:bg-secondary"><Check className="h-4 w-4 text-primary" /> Try a demo account</button>
        <p className="mt-10 text-center text-xs leading-5 text-muted-foreground">By continuing, you’re making a little more room for clarity.</p>
      </div></section>
    </div>
  </main>;
}