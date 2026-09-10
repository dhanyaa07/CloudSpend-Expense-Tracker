import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BrainCircuit,
  CircleAlert,
  Compass,
  RefreshCw,
  Sparkles,
  Target,
} from 'lucide-react';
import {
  getGetCloudSpendInsightsQueryKey,
  useGetCloudSpendInsights,
} from '@workspace/api-client-react';
import { AppShell, getUsername, PageHeader } from '@/components/app-shell';

const money = (value = 0) =>
  `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const dateLabel = (value: string) =>
  new Date(`${value}T12:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

function InsightsSkeleton() {
  return (
    <AppShell>
      <PageHeader eyebrow="A clearer signal" title="Insights" description="Reading the shape of your spending…" />
      <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <div className="skeleton h-72 rounded-2xl" />
        <div className="skeleton h-72 rounded-2xl" />
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="skeleton h-64 rounded-2xl" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    </AppShell>
  );
}

export default function Insights() {
  const username = getUsername();
  const insightsQuery = useGetCloudSpendInsights(username, {
    query: { queryKey: getGetCloudSpendInsightsQueryKey(username) },
  });

  if (insightsQuery.isLoading) return <InsightsSkeleton />;
  if (insightsQuery.isError || !insightsQuery.data) {
    return (
      <AppShell>
        <div className="page-enter flex min-h-[60vh] items-center justify-center">
          <div className="max-w-sm text-center">
            <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
              <RefreshCw className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">The signal is quiet.</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              We couldn’t load your insights right now. Your spending records are safe.
            </p>
            <button
              type="button"
              data-testid="button-retry-insights"
              onClick={() => insightsQuery.refetch()}
              className="mt-6 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
            >
              Try again
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  const { patterns, recommendations, anomalies, forecast } = insightsQuery.data;
  const trendIsUp = forecast.trend.toLowerCase().includes('up') || forecast.trend.toLowerCase().includes('increase');

  return (
    <AppShell>
      <PageHeader
        eyebrow="A clearer signal"
        title="Insights"
        description="Small observations that make your next money decision easier."
        action={
          <div className="flex items-center gap-2 rounded-xl border border-primary/15 bg-secondary px-3 py-2 text-xs font-bold text-secondary-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            Personal to {username}
          </div>
        }
      />

      <section className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <div className="page-enter rounded-2xl border border-primary/20 bg-[#e2f2ec] p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#286658]">Forward look</p>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-[#1f554b]">Next month, in view.</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-[#48776d]">
                Based on your recent rhythm, this is the shape your next month may take.
              </p>
            </div>
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/60 text-[#286658]">
              <Compass className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-end gap-x-10 gap-y-5">
            <div>
              <p className="text-xs font-bold text-[#48776d]">Forecast</p>
              <p className="mt-1 font-mono text-4xl tracking-[-0.06em] text-[#1f554b]" data-testid="text-insights-forecast">
                {money(forecast.nextMonth)}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-[#48776d]">Average daily</p>
              <p className="mt-2 font-mono text-xl text-[#1f554b]">{money(forecast.averageDaily)}</p>
            </div>
            <div className="ml-auto flex items-center gap-1 rounded-full bg-white/60 px-2.5 py-1 text-xs font-bold text-[#286658]">
              {trendIsUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {forecast.trend}
            </div>
          </div>
          <div className="mt-7 flex items-center justify-between border-t border-[#b8d9cb] pt-4 text-xs text-[#48776d]">
            <span>Confidence</span>
            <span className="font-bold text-[#286658]">{forecast.confidence}</span>
          </div>
        </div>

        <section className="page-enter stagger-1 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Your patterns</p>
              <h2 className="mt-2 text-xl font-extrabold tracking-tight">What keeps showing up</h2>
            </div>
            <BrainCircuit className="h-5 w-5 text-muted-foreground" />
          </div>
          {patterns.length ? (
            <div className="mt-6 space-y-4">
              {patterns.map((pattern, index) => (
                <div key={`${pattern.label}-${index}`} data-testid={`card-insight-pattern-${index}`} className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                    <Activity className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-bold">{pattern.label}</p>
                      <span className="font-mono text-xs text-primary">{pattern.value}</span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{pattern.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-8 rounded-xl bg-muted p-4 text-sm text-muted-foreground">More patterns will appear as your records grow.</p>
          )}
        </section>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <div className="page-enter stagger-2 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">A little nudge</p>
              <h2 className="mt-2 text-xl font-extrabold tracking-tight">Recommendations</h2>
            </div>
            <Target className="h-5 w-5 text-muted-foreground" />
          </div>
          {recommendations.length ? (
            <div className="mt-6 divide-y divide-border">
              {recommendations.map((recommendation, index) => (
                <div key={`${recommendation.title}-${index}`} data-testid={`card-insight-recommendation-${index}`} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#f6e9cd] text-[#9a681b]">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-extrabold">{recommendation.title}</h3>
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-secondary-foreground">{recommendation.impact}</span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{recommendation.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-8 rounded-xl bg-muted p-4 text-sm text-muted-foreground">No recommendations yet. Keep logging what matters.</p>
          )}
        </div>

        <div className="page-enter stagger-3 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#a35b4f]">Worth a second look</p>
              <h2 className="mt-2 text-xl font-extrabold tracking-tight">Unusual activity</h2>
            </div>
            <CircleAlert className="h-5 w-5 text-[#a35b4f]" />
          </div>
          {anomalies.length ? (
            <div className="mt-6 space-y-3">
              {anomalies.map((anomaly, index) => (
                <div key={anomaly.expenseId} data-testid={`card-insight-anomaly-${index}`} className="rounded-xl border border-[#efd8d2] bg-[#fff7f5] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-bold">{anomaly.description}</p>
                    <span className="shrink-0 font-mono text-sm">{money(anomaly.amount)}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{dateLabel(anomaly.date)} · {anomaly.reason}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-xl bg-muted p-4">
              <p className="text-sm font-bold">Nothing unusual spotted.</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Your recent spending is moving within its usual range.</p>
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}