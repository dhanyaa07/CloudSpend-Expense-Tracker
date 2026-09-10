import { Router, type IRouter } from "express";
import { and, asc, desc, eq, gte, ilike, lte } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { db } from "@workspace/db";
import {
  cloudspendExpensesTable,
  cloudspendUsersTable,
} from "@workspace/db";
import {
  CreateCloudSpendExpenseBody,
  GetCloudSpendDashboardParams,
  GetCloudSpendInsightsParams,
  GetCloudSpendUserParams,
  ListCloudSpendExpensesQueryParams,
  UpdateCloudSpendBudgetBody,
  UpdateCloudSpendBudgetParams,
  UpdateCloudSpendExpenseBody,
  UpdateCloudSpendExpenseParams,
} from "@workspace/api-zod";

const router: IRouter = Router();
const toExpense = (row: typeof cloudspendExpensesTable.$inferSelect) => ({
  id: row.id,
  username: row.username,
  amount: Number(row.amount),
  category: row.category,
  description: row.description,
  date: row.date,
  paymentMethod: row.paymentMethod,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const toUser = (row: typeof cloudspendUsersTable.$inferSelect) => ({
  username: row.username,
  monthlyBudget: Number(row.monthlyBudget),
  categoryBudgets: row.categoryBudgets ?? {},
});

async function getOrCreateUser(username: string) {
  const existing = await db.query.cloudspendUsersTable.findFirst({
    where: eq(cloudspendUsersTable.username, username),
  });
  if (existing) return existing;
  const [created] = await db.insert(cloudspendUsersTable).values({ username }).returning();
  if (username === "demo_user") {
    const today = new Date();
    const samples = [
      [58, "Food", "Neighborhood coffee", "UPI"],
      [160, "Transport", "Metro recharge", "UPI"],
      [780, "Shopping", "Work essentials", "Credit Card"],
      [2400, "Bills", "Internet bill", "Net Banking"],
      [350, "Entertainment", "Cinema night", "Debit Card"],
      [420, "Health", "Pharmacy", "Cash"],
      [1200, "Education", "Design course", "Credit Card"],
      [95, "Food", "Lunch with friends", "UPI"],
      [280, "Transport", "Cab ride", "UPI"],
      [1450, "Shopping", "Weekend market", "Debit Card"],
      [1800, "Bills", "Electricity bill", "Net Banking"],
      [520, "Entertainment", "Streaming and music", "Credit Card"],
      [680, "Health", "Wellness appointment", "UPI"],
      [890, "Education", "Books and supplies", "Cash"],
      [210, "Other", "Gifts and small extras", "Cash"],
    ] as const;
    await db.insert(cloudspendExpensesTable).values(samples.map(([amount, category, description, paymentMethod], index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (index * 4 + 1));
      return {
        id: randomUUID(),
        username,
        amount: amount.toFixed(2),
        category,
        description,
        date: date.toISOString().slice(0, 10),
        paymentMethod,
      };
    }));
  }
  return created;
}

router.get("/cloudspend/users/:username", async (req, res, next) => {
  try {
    const { username } = GetCloudSpendUserParams.parse(req.params);
    res.json(toUser(await getOrCreateUser(username)));
  } catch (error) {
    next(error);
  }
});

router.put("/cloudspend/users/:username/budget", async (req, res, next) => {
  try {
    const { username } = UpdateCloudSpendBudgetParams.parse(req.params);
    const body = UpdateCloudSpendBudgetBody.parse(req.body);
    await getOrCreateUser(username);
    const [updated] = await db
      .update(cloudspendUsersTable)
      .set({
        monthlyBudget: body.monthlyBudget.toFixed(2),
        categoryBudgets: body.categoryBudgets,
        updatedAt: new Date(),
      })
      .where(eq(cloudspendUsersTable.username, username))
      .returning();
    res.json(toUser(updated));
  } catch (error) {
    next(error);
  }
});

router.get("/cloudspend/expenses", async (req, res, next) => {
  try {
    const query = ListCloudSpendExpensesQueryParams.parse({
      ...req.query,
      startDate: req.query.startDate ? new Date(String(req.query.startDate)) : undefined,
      endDate: req.query.endDate ? new Date(String(req.query.endDate)) : undefined,
    });
    const conditions = [eq(cloudspendExpensesTable.username, query.username)];
    if (query.category) conditions.push(eq(cloudspendExpensesTable.category, query.category));
    if (query.startDate) conditions.push(gte(cloudspendExpensesTable.date, query.startDate.toISOString().slice(0, 10)));
    if (query.endDate) conditions.push(lte(cloudspendExpensesTable.date, query.endDate.toISOString().slice(0, 10)));
    if (query.search) conditions.push(ilike(cloudspendExpensesTable.description, `%${query.search}%`));
    const rows = await db
      .select()
      .from(cloudspendExpensesTable)
      .where(and(...conditions))
      .orderBy(desc(cloudspendExpensesTable.date), desc(cloudspendExpensesTable.createdAt));
    res.json(rows.map(toExpense));
  } catch (error) {
    next(error);
  }
});

router.post("/cloudspend/expenses", async (req, res, next) => {
  try {
    const body = CreateCloudSpendExpenseBody.parse(req.body);
    await getOrCreateUser(body.username);
    const [created] = await db
      .insert(cloudspendExpensesTable)
      .values({
        id: randomUUID(),
        username: body.username,
        amount: body.amount.toFixed(2),
        category: body.category,
        description: body.description,
        date: body.date.toISOString().slice(0, 10),
        paymentMethod: body.paymentMethod,
      })
      .returning();
    res.status(201).json(toExpense(created));
  } catch (error) {
    next(error);
  }
});

router.patch("/cloudspend/expenses/:expenseId", async (req, res, next) => {
  try {
    const { expenseId } = UpdateCloudSpendExpenseParams.parse(req.params);
    const body = UpdateCloudSpendExpenseBody.parse(req.body);
    const [updated] = await db
      .update(cloudspendExpensesTable)
      .set({
        ...(body.amount === undefined ? {} : { amount: body.amount.toFixed(2) }),
        ...(body.category === undefined ? {} : { category: body.category }),
        ...(body.description === undefined ? {} : { description: body.description }),
        ...(body.date === undefined ? {} : { date: body.date.toISOString().slice(0, 10) }),
        ...(body.paymentMethod === undefined ? {} : { paymentMethod: body.paymentMethod }),
        updatedAt: new Date(),
      })
      .where(eq(cloudspendExpensesTable.id, expenseId))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Expense not found" });
      return;
    }
    res.json(toExpense(updated));
  } catch (error) {
    next(error);
  }
});

router.delete("/cloudspend/expenses/:expenseId", async (req, res, next) => {
  try {
    const { expenseId } = UpdateCloudSpendExpenseParams.parse(req.params);
    const deleted = await db.delete(cloudspendExpensesTable).where(eq(cloudspendExpensesTable.id, expenseId)).returning({ id: cloudspendExpensesTable.id });
    if (!deleted.length) {
      res.status(404).json({ error: "Expense not found" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get("/cloudspend/dashboard/:username", async (req, res, next) => {
  try {
    const { username } = GetCloudSpendDashboardParams.parse(req.params);
    const user = await getOrCreateUser(username);
    const rows = await db
      .select()
      .from(cloudspendExpensesTable)
      .where(eq(cloudspendExpensesTable.username, username))
      .orderBy(asc(cloudspendExpensesTable.date));
    const now = new Date();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const currentMonth = now.toISOString().slice(0, 7);
    const lastMonth = lastMonthStart.toISOString().slice(0, 7);
    const total = rows.reduce((sum, row) => sum + Number(row.amount), 0);
    const monthSpend = rows.filter((row) => row.date.startsWith(currentMonth)).reduce((sum, row) => sum + Number(row.amount), 0);
    const lastMonthSpend = rows.filter((row) => row.date.startsWith(lastMonth)).reduce((sum, row) => sum + Number(row.amount), 0);
    const categoryMap = new Map<string, number>();
    const trendMap = new Map<string, number>();
    for (const row of rows) {
      categoryMap.set(row.category, (categoryMap.get(row.category) ?? 0) + Number(row.amount));
      trendMap.set(row.date, (trendMap.get(row.date) ?? 0) + Number(row.amount));
    }
    const comparison = lastMonthSpend === 0 ? (monthSpend > 0 ? 100 : 0) : ((monthSpend - lastMonthSpend) / lastMonthSpend) * 100;
    res.json({
      summary: {
        total,
        average: rows.length ? total / rows.length : 0,
        highest: rows.length ? Math.max(...rows.map((row) => Number(row.amount))) : 0,
        count: rows.length,
        monthSpend,
        lastMonthSpend,
      },
      monthComparison: comparison,
      categoryBreakdown: Array.from(categoryMap, ([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount),
      trend: Array.from(trendMap, ([date, amount]) => ({ date, amount })),
      recentExpenses: rows.slice(-5).reverse().map(toExpense),
      user: toUser(user),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/cloudspend/insights/:username", async (req, res, next) => {
  try {
    const { username } = GetCloudSpendInsightsParams.parse(req.params);
    const user = await getOrCreateUser(username);
    const rows = await db
      .select()
      .from(cloudspendExpensesTable)
      .where(eq(cloudspendExpensesTable.username, username))
      .orderBy(asc(cloudspendExpensesTable.date));
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const todayTime = now.getTime();
    const monthKey = today.slice(0, 7);
    const currentMonthRows = rows.filter((row) => row.date.startsWith(monthKey));
    const currentMonthSpend = currentMonthRows.reduce((sum, row) => sum + Number(row.amount), 0);
    const monthlyBudget = Number(user.monthlyBudget);
    const categoryTotals = new Map<string, number>();
    for (const row of rows) {
      categoryTotals.set(row.category, (categoryTotals.get(row.category) ?? 0) + Number(row.amount));
    }
    const rankedCategories = Array.from(categoryTotals, ([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount);
    const topCategory = rankedCategories[0];
    const amounts = rows.map((row) => Number(row.amount));
    const averageAmount = amounts.length ? amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length : 0;
    const variance = amounts.length ? amounts.reduce((sum, amount) => sum + (amount - averageAmount) ** 2, 0) / amounts.length : 0;
    const standardDeviation = Math.sqrt(variance);
    const anomalyFloor = Math.max(averageAmount * 2.25, averageAmount + standardDeviation * 1.75);
    const anomalies = rows
      .filter((row) => Number(row.amount) >= anomalyFloor && Number(row.amount) > 0)
      .sort((a, b) => Number(b.amount) - Number(a.amount))
      .slice(0, 5)
      .map((row) => ({
        expenseId: row.id,
        description: row.description,
        amount: Number(row.amount),
        date: row.date,
        reason: `This is ${averageAmount ? (Number(row.amount) / averageAmount).toFixed(1) : "a"}× your average expense.`,
      }));

    const recentCutoff = new Date(todayTime);
    recentCutoff.setDate(recentCutoff.getDate() - 30);
    const recentCutoffKey = recentCutoff.toISOString().slice(0, 10);
    const recentRows = rows.filter((row) => row.date >= recentCutoffKey && row.date <= today);
    const recentSpend = recentRows.reduce((sum, row) => sum + Number(row.amount), 0);
    const averageDaily = recentSpend / 30;
    const monthlyTotals = new Map<string, number>();
    for (const row of rows) {
      const key = row.date.slice(0, 7);
      monthlyTotals.set(key, (monthlyTotals.get(key) ?? 0) + Number(row.amount));
    }
    const historicalMonthlyValues = Array.from(monthlyTotals.values()).slice(-3);
    const historicalAverage = historicalMonthlyValues.length
      ? historicalMonthlyValues.reduce((sum, value) => sum + value, 0) / historicalMonthlyValues.length
      : 0;
    const nextMonth = recentRows.length >= 3 ? averageDaily * 30 : historicalAverage || currentMonthSpend;
    const trend = nextMonth > historicalAverage * 1.08 ? "rising" : nextMonth < historicalAverage * 0.92 ? "cooling" : "steady";
    const confidence = rows.length >= 20 || monthlyTotals.size >= 3 ? "High" : rows.length >= 8 ? "Medium" : "Early";

    const patterns = rows.length
      ? [
          {
            label: "Top category",
            detail: `${topCategory?.category ?? "No category"} accounts for ${topCategory && categoryTotals.size ? Math.round((topCategory.amount / Math.max(1, rows.reduce((sum, row) => sum + Number(row.amount), 0))) * 100) : 0}% of your recorded spend.`,
            value: topCategory?.category ?? "—",
          },
          {
            label: "Typical expense",
            detail: "Your typical transaction size across the history you have logged.",
            value: `$${averageAmount.toFixed(0)}`,
          },
          {
            label: "30-day pace",
            detail: "Your recent pace annualized to a simple monthly view.",
            value: `$${(averageDaily * 30).toFixed(0)}`,
          },
        ]
      : [
          { label: "Build your baseline", detail: "Add a few expenses and CloudSpend will start spotting patterns.", value: "Just getting started" },
        ];

    const recommendations = [];
    if (monthlyBudget > 0 && currentMonthSpend > monthlyBudget) {
      recommendations.push({
        title: "Your month is over budget",
        detail: `You are $${(currentMonthSpend - monthlyBudget).toFixed(0)} above your monthly plan. Review ${topCategory?.category ?? "your largest category"} first.`,
        impact: "High impact",
      });
    } else if (monthlyBudget > 0 && currentMonthSpend > monthlyBudget * 0.8) {
      recommendations.push({
        title: "Give the rest of the month some room",
        detail: `You have $${Math.max(0, monthlyBudget - currentMonthSpend).toFixed(0)} left in your monthly plan.`,
        impact: "Worth watching",
      });
    }
    if (topCategory && user.categoryBudgets?.[topCategory.category] && topCategory.amount > Number(user.categoryBudgets[topCategory.category])) {
      recommendations.push({
        title: `${topCategory.category} is above its guardrail`,
        detail: `Consider lowering the next few ${topCategory.category.toLowerCase()} purchases or adjusting the category plan.`,
        impact: "Category alert",
      });
    }
    if (anomalies.length) {
      recommendations.push({
        title: "Review an unusual expense",
        detail: `${anomalies[0].description} is much larger than your usual transaction.`,
        impact: "Worth a look",
      });
    }
    if (!recommendations.length) {
      recommendations.push({
        title: rows.length ? "Your spending is in a steady place" : "Start with one expense",
        detail: rows.length ? "Keep logging consistently and CloudSpend will sharpen these recommendations over time." : "A small, consistent ledger is enough to unlock useful patterns.",
        impact: rows.length ? "Good momentum" : "Next step",
      });
    }

    res.json({
      patterns,
      recommendations: recommendations.slice(0, 4),
      anomalies,
      forecast: {
        nextMonth,
        averageDaily,
        confidence,
        trend,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;