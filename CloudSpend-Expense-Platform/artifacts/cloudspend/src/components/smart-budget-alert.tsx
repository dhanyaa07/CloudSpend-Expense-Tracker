import { AlertTriangle, ArrowUpRight, Sparkles } from 'lucide-react';

type CategorySpend = {
  category: string;
  amount: number;
};

type SmartBudgetAlertProps = {
  monthlyBudget?: number;
  monthSpend?: number;
  categoryBudgets?: Record<string, number>;
  categoryBreakdown?: CategorySpend[];
  compact?: boolean;
};

const money = (value = 0) =>
  `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export function SmartBudgetAlert({
  monthlyBudget = 0,
  monthSpend = 0,
  categoryBudgets = {},
  categoryBreakdown = [],
  compact = false,
}: SmartBudgetAlertProps) {
  const monthlyRatio = monthlyBudget > 0 ? monthSpend / monthlyBudget : 0;
  const leadingCategory = categoryBreakdown
    .map((item) => ({
      ...item,
      budget: categoryBudgets[item.category] ?? 0,
    }))
    .filter((item) => item.budget > 0)
    .sort((a, b) => b.amount / b.budget - a.amount / a.budget)[0];

  const categoryRatio = leadingCategory
    ? leadingCategory.amount / leadingCategory.budget
    : 0;
  const isMonthlyConcern = monthlyBudget > 0 && monthlyRatio >= 0.8;
  const isCategoryConcern = Boolean(leadingCategory && categoryRatio >= 0.8);

  if (!isMonthlyConcern && !isCategoryConcern) {
    return (
      <div
        data-testid="card-smart-budget-alert"
        className={`flex items-start gap-3 rounded-2xl border border-primary/15 bg-secondary/65 ${
          compact ? 'p-4' : 'p-5'
        }`}
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Sparkles className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-extrabold text-secondary-foreground">A steady month so far</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            No budget pressure to flag yet. We’ll keep watching the pattern with you.
          </p>
        </div>
      </div>
    );
  }

  const title = isMonthlyConcern
    ? monthlyRatio >= 1
      ? 'Your monthly plan needs a reset'
      : 'You’re getting close to your monthly plan'
    : `${leadingCategory?.category} is moving quickly`;
  const detail = isMonthlyConcern
    ? monthlyRatio >= 1
      ? `You’ve spent ${money(monthSpend)} against ${money(monthlyBudget)}. A small adjustment now can make the rest of the month easier.`
      : `${Math.round(monthlyRatio * 100)}% of your ${money(monthlyBudget)} plan is spoken for. You have ${money(Math.max(monthlyBudget - monthSpend, 0))} left to work with.`
    : `${leadingCategory?.category} is at ${Math.round(categoryRatio * 100)}% of its ${money(leadingCategory?.budget)} guardrail.`;

  return (
    <div
      data-testid="card-smart-budget-alert"
      className={`flex items-start gap-3 rounded-2xl border border-accent/35 bg-[#fff7e7] ${
        compact ? 'p-4' : 'p-5'
      }`}
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent/25 text-[#93681f]">
        <AlertTriangle className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-extrabold text-[#70501f]">{title}</p>
          {isMonthlyConcern && (
            <span className="rounded-full bg-accent/25 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#93681f]">
              Smart alert
            </span>
          )}
        </div>
        <p className="mt-1 text-xs leading-5 text-[#806a45]">{detail}</p>
        {!compact && (
          <p className="mt-3 flex items-center gap-1 text-xs font-bold text-[#93681f]">
            Review your plan <ArrowUpRight className="h-3.5 w-3.5" />
          </p>
        )}
      </div>
    </div>
  );
}