import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(), email: text("email").notNull(), passwordHash: text("password_hash").notNull(), passwordSalt: text("password_salt").notNull(), role: text("role", { enum: ["user", "admin"] }).notNull().default("user"), emailVerifiedAt: text("email_verified_at"), createdAt: text("created_at").notNull(), updatedAt: text("updated_at").notNull(), deletedAt: text("deleted_at"),
}, (table) => [uniqueIndex("users_email_unique").on(table.email)]);

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }), expiresAt: text("expires_at").notNull(), createdAt: text("created_at").notNull(),
}, (table) => [index("sessions_user_idx").on(table.userId), index("sessions_expiry_idx").on(table.expiresAt)]);

export const authTokens = sqliteTable("auth_tokens", {
  id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }), kind: text("kind", { enum: ["verify_email", "reset_password"] }).notNull(), expiresAt: text("expires_at").notNull(), usedAt: text("used_at"), createdAt: text("created_at").notNull(),
}, (table) => [index("auth_tokens_user_idx").on(table.userId)]);

export const procedures = sqliteTable("procedures", {
  id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }), type: text("type").notNull(), title: text("title").notNull(), dataJson: text("data_json").notNull(), createdAt: text("created_at").notNull(), updatedAt: text("updated_at").notNull(),
}, (table) => [index("procedures_user_idx").on(table.userId)]);

export const conversations = sqliteTable("conversations", {
  id: text("id").primaryKey(), userId: text("user_id").references(() => users.id, { onDelete: "cascade" }), createdAt: text("created_at").notNull(), expiresAt: text("expires_at").notNull(), deletedAt: text("deleted_at"),
}, (table) => [index("conversations_user_idx").on(table.userId), index("conversations_expiry_idx").on(table.expiresAt)]);

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(), conversationId: text("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }), role: text("role").notNull(), content: text("content").notNull(), createdAt: text("created_at").notNull(),
}, (table) => [index("messages_conversation_idx").on(table.conversationId)]);

export const payments = sqliteTable("payments", {
  id: text("id").primaryKey(), userId: text("user_id").references(() => users.id, { onDelete: "set null" }), providerOrderId: text("provider_order_id"), providerCaptureId: text("provider_capture_id"), providerSubscriptionId: text("provider_subscription_id"), kind: text("kind", { enum: ["one_time", "subscription"] }).notNull(), status: text("status").notNull(), amountCents: integer("amount_cents").notNull(), currency: text("currency").notNull().default("EUR"), createdAt: text("created_at").notNull(), updatedAt: text("updated_at").notNull(),
}, (table) => [uniqueIndex("payments_order_unique").on(table.providerOrderId), index("payments_user_idx").on(table.userId)]);

export const webhookEvents = sqliteTable("webhook_events", { id: text("id").primaryKey(), eventType: text("event_type").notNull(), receivedAt: text("received_at").notNull(), processedAt: text("processed_at") });
export const sourceRegistry = sqliteTable("source_registry", { id: text("id").primaryKey(), organization: text("organization").notNull(), title: text("title").notNull(), url: text("url").notNull(), enabled: integer("enabled", { mode: "boolean" }).notNull().default(true), lastVerifiedAt: text("last_verified_at"), updatedAt: text("updated_at").notNull() });
export const prices = sqliteTable("prices", { id: text("id").primaryKey(), label: text("label").notNull(), amountCents: integer("amount_cents").notNull(), currency: text("currency").notNull().default("EUR"), active: integer("active", { mode: "boolean" }).notNull().default(true), providerPlanId: text("provider_plan_id"), updatedAt: text("updated_at").notNull() });
export const feedback = sqliteTable("feedback", { id: text("id").primaryKey(), userId: text("user_id").references(() => users.id, { onDelete: "set null" }), responseId: text("response_id"), reason: text("reason").notNull(), createdAt: text("created_at").notNull(), status: text("status").notNull().default("open") });
export const contacts = sqliteTable("contacts", { id: text("id").primaryKey(), email: text("email").notNull(), subject: text("subject").notNull(), message: text("message").notNull(), createdAt: text("created_at").notNull(), status: text("status").notNull().default("new") });
export const auditLogs = sqliteTable("audit_logs", { id: text("id").primaryKey(), actorUserId: text("actor_user_id").references(() => users.id, { onDelete: "set null" }), action: text("action").notNull(), targetType: text("target_type"), targetId: text("target_id"), createdAt: text("created_at").notNull() });
export const systemErrors = sqliteTable("system_errors", { id: text("id").primaryKey(), code: text("code").notNull(), route: text("route"), message: text("message").notNull(), createdAt: text("created_at").notNull(), resolvedAt: text("resolved_at") });
