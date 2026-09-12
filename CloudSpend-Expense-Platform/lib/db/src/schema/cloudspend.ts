import { createInsertSchema } from "drizzle-zod";
import { boolean, date, jsonb, numeric, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const cloudspendUsersTable = pgTable("cloudspend_users", {
  username: text("username").primaryKey(),
  displayName: text("display_name"),
  email: text("email"),
  monthlyBudget: numeric("monthly_budget", { precision: 12, scale: 2 }).notNull().default("15000"),
  categoryBudgets: jsonb("category_budgets").$type<Record<string, number>>().notNull().default({}),
  emailAlertsEnabled: boolean("email_alerts_enabled").notNull().default(false),
  smsAlertsEnabled: boolean("sms_alerts_enabled").notNull().default(false),
  alertEmail: text("alert_email"),
  alertPhone: text("alert_phone"),
  alertThreshold: numeric("alert_threshold", { precision: 5, scale: 2 }).notNull().default("80"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const cloudspendExpensesTable = pgTable("cloudspend_expenses", {
  id: text("id").primaryKey(),
  username: text("username").notNull().references(() => cloudspendUsersTable.username, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  date: date("date", { mode: "string" }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCloudSpendUserSchema = createInsertSchema(cloudspendUsersTable).omit({
  createdAt: true,
  updatedAt: true,
});
export const insertCloudSpendExpenseSchema = createInsertSchema(cloudspendExpensesTable).omit({
  createdAt: true,
  updatedAt: true,
});

export type InsertCloudSpendUser = z.infer<typeof insertCloudSpendUserSchema>;
export type CloudSpendUser = typeof cloudspendUsersTable.$inferSelect;
export type InsertCloudSpendExpense = z.infer<typeof insertCloudSpendExpenseSchema>;
export type CloudSpendExpense = typeof cloudspendExpensesTable.$inferSelect;