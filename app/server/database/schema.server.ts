import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  integer,
  numeric,
  pgTable,
  pgView,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

// ── Better Auth Tables (camelCase columns in Postgres) ────────────────────────

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  expiresAt: timestamp("expires_at", { mode: "date", withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).notNull(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", {
    mode: "date",
    withTimezone: true,
  }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
    mode: "date",
    withTimezone: true,
  }),
  idToken: text("id_token"),
  password: text("password"),
  scope: text("scope"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { mode: "date", withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
});

// ── Application Tables (snake_case columns in Postgres) ────────────────────────

export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  searchKeyword: text("search_keyword").notNull(),
  businessName: text("business_name"),
  category: text("category"),
  phone: text("phone"),
  website: text("website"),
  address: text("address"),
  region: text("region"),
  wardId: integer("ward_id").references(() => wards.id, { onDelete: "set null" }),
  rating: numeric("rating"),
  reviewCount: integer("review_count"),
  imageReviewCount: integer("image_review_count").default(0),
  mapsUrl: text("maps_url").notNull().unique(),
  reviewImageUrls: text("review_image_urls")
    .array()
    .default(sql`'{}'::TEXT[]`),
  status: text("status").default("new").notNull(),
  isCorrected: boolean("is_corrected").default(true),
  scrapedAt: timestamp("scraped_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
});

export const districts = pgTable("districts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const wards = pgTable(
  "wards",
  {
    id: serial("id").primaryKey(),
    districtId: integer("district_id")
      .notNull()
      .references(() => districts.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
  },
  (table) => {
    return [unique("wards_name_district_unique").on(table.name, table.districtId)];
  },
);

export const scrapeRuns = pgTable("scrape_runs", {
  id: serial("id").primaryKey(),
  keyword: text("keyword").notNull(),
  status: text("status").default("running").notNull(),
  totalScraped: integer("total_scraped").default(0).notNull(),
  listingsFound: integer("listings_found").default(0).notNull(),
  skippedDups: integer("skipped_dups").default(0).notNull(),
  succeeded: integer("succeeded").default(0).notNull(),
  failed: integer("failed").default(0).notNull(),
  errors: text("errors")
    .array()
    .default(sql`'{}'::TEXT[]`),
  durationMs: bigint("duration_ms", { mode: "bigint" })
    .default(sql`0`)
    .notNull(),
  startedAt: timestamp("started_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  finishedAt: timestamp("finished_at", { mode: "date", withTimezone: true }),
});

export const businessNotes = pgTable("business_notes", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
});

export const userInvites = pgTable("user_invites", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  invitedAt: timestamp("invited_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
});

export const approachLists = pgTable("approach_lists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
});

export const approachListItems = pgTable(
  "approach_list_items",
  {
    id: serial("id").primaryKey(),
    listId: integer("list_id")
      .notNull()
      .references(() => approachLists.id, { onDelete: "cascade" }),
    businessId: integer("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    note: text("note"),
    addedAt: timestamp("added_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  },
  (table) => {
    return [unique("approach_list_items_list_business_unique").on(table.listId, table.businessId)];
  },
);

// ── Read-only View ────────────────────────────────────────────────────────────

export const vBusinessesClassified = pgView("v_businesses_classified", {
  id: integer("id"),
  searchKeyword: text("search_keyword"),
  businessName: text("business_name"),
  category: text("category"),
  phone: text("phone"),
  website: text("website"),
  address: text("address"),
  region: text("region"),
  districtCity: text("district_city"),
  wardCommune: text("ward_commune"),
  rating: numeric("rating"),
  reviewCount: integer("review_count"),
  mapsUrl: text("maps_url"),
  reviewImageUrls: text("review_image_urls").array(),
  status: text("status"),
  isCorrected: boolean("is_corrected"),
  scrapedAt: timestamp("scraped_at", { mode: "date", withTimezone: true }),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }),
}).as(sql`
  SELECT
    b.id,
    b.search_keyword,
    b.business_name,
    b.phone,
    b.website,
    b.address,
    b.category,
    b.region,
    b.rating,
    b.review_count,
    b.maps_url,
    b.review_image_urls,
    b.status,
    b.scraped_at,
    b.created_at,
    b.is_corrected,
    w.name AS ward_commune,
    d.name AS district_city
  FROM businesses b
  LEFT JOIN wards w ON b.ward_id = w.id
  LEFT JOIN districts d ON w.district_id = d.id
`);
