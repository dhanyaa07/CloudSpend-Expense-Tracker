import { FormEvent, useState } from 'react';
import { Bot, Loader2, Send, Sparkles } from 'lucide-react';
import { useAskCloudSpendCopilot } from '@workspace/api-client-react';
import { AppShell, getUsername, PageHeader } from '@/components/app-shell';

type ChatMessage = { role: 'user' | 'assistant'; content: string };
const starterPrompts = ['How much budget do I have left?', 'What category is driving my spending?', 'Where could I trim this month?'];

export default function Copilot() {
  const username = getUsername();
  const ask = useAskCloudSpendCopilot();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'assistant', content: 'I’m your CloudSpend Copilot. Ask me about your budget, categories, or a practical next step.' }]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const message = input.trim();
    if (!message || ask.isPending) return;
    setInput('');
    setMessages((current) => [...current, { role: 'user', content: message }]);
    ask.mutate({ username, data: { message } }, { onSuccess: (result) => setMessages((current) => [...current, { role: 'assistant', content: result.reply }]), onError: () => setMessages((current) => [...current, { role: 'assistant', content: 'I couldn’t reach your spending data just now. Try again in a moment.' }]) });
  }

  return <AppShell>
    <PageHeader eyebrow="A smarter money conversation" title="Copilot" description="A private, grounded assistant that answers from your CloudSpend history." action={<div className="flex items-center gap-2 rounded-xl border border-primary/15 bg-secondary px-3 py-2 text-xs font-bold text-secondary-foreground"><Sparkles className="h-4 w-4 text-primary" /> Grounded in your ledger</div>} />
    <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-3 border-b border-border bg-[#eff8f3] px-5 py-4"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-primary-foreground"><Bot className="h-5 w-5" /></span><div><p className="font-extrabold">CloudSpend Copilot</p><p className="text-xs text-muted-foreground">Useful context, no judgment</p></div></div>
      <div className="min-h-[420px] space-y-4 p-5 sm:p-7">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>{message.content}</div></div>)}{ask.isPending && <div className="flex gap-3"><div className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Reading your latest numbers…</div></div>}</div>
      <div className="border-t border-border p-4 sm:p-5"><div className="mb-3 flex flex-wrap gap-2">{starterPrompts.map((prompt) => <button key={prompt} type="button" onClick={() => setInput(prompt)} className="rounded-full border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:border-primary hover:text-primary">{prompt}</button>)}</div><form onSubmit={submit} className="flex gap-2"><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about your spending…" className="h-12 min-w-0 flex-1 rounded-xl border border-input bg-background px-4 text-sm outline-none focus:ring-4 focus:ring-primary/15" /><button type="submit" disabled={!input.trim() || ask.isPending} className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground disabled:opacity-50" aria-label="Send message"><Send className="h-4 w-4" /></button></form></div>
    </div>
  </AppShell>;
}