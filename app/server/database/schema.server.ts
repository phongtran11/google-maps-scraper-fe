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
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  id: text("id").primaryKey(),
  image: text("image"),
  name: text("name").notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
});

export const session = pgTable("session", {
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { mode: "date", withTimezone: true }).notNull(),
  id: text("id").primaryKey(),
  ipAddress: text("ip_address"),
  token: text("token").notNull().unique(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).notNull(),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  accessToken: text("access_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", {
    mode: "date",
    withTimezone: true,
  }),
  accountId: text("account_id").notNull(),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  id: text("id").primaryKey(),
  idToken: text("id_token"),
  password: text("password"),
  providerId: text("provider_id").notNull(),
  refreshToken: text("refresh_token"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
    mode: "date",
    withTimezone: true,
  }),
  scope: text("scope"),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const verification = pgTable("verification", {
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { mode: "date", withTimezone: true }).notNull(),
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  value: text("value").notNull(),
});

// ── Application Tables (snake_case columns in Postgres) ────────────────────────

export const businesses = pgTable("businesses", {
  address: text("address"),
  businessName: text("business_name"),
  category: text("category"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
  id: serial("id").primaryKey(),
  imageReviewCount: integer("image_review_count").default(0),
  isCorrected: boolean("is_corrected").default(true),
  mapsUrl: text("maps_url").notNull().unique(),
  rating: numeric("rating"),
  region: text("region"),
  review_count: integer("review_count"),
  reviewImageUrls: text("review_image_urls")
    .array()
    .default(sql`'{}'::TEXT[]`),
  scraped_at: timestamp("scraped_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  scrapedAt: timestamp("scraped_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  search_keyword: text("search_keyword").notNull(),
  status: text("status").default("new").notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  wardId: integer("ward_id").references(() => wards.id, { onDelete: "set null" }),
});

export const districts = pgTable("districts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const wards = pgTable(
  "wards",
  {
    district_id: integer("district_id")
      .notNull()
      .references(() => districts.id, { onDelete: "cascade" }),
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
  },
  (table) => {
    return [unique("wards_name_district_unique").on(table.name, table.district_id)];
  },
);

export const scrapeRuns = pgTable("scrape_runs", {
  duration_ms: bigint("duration_ms", { mode: "bigint" })
    .default(sql`0`)
    .notNull(),
  errors: text("errors")
    .array()
    .default(sql`'{}'::TEXT[]`),
  failed: integer("failed").default(0).notNull(),
  finished_at: timestamp("finished_at", { mode: "date", withTimezone: true }),
  id: serial("id").primaryKey(),
  keyword: text("keyword").notNull(),
  listings_found: integer("listings_found").default(0).notNull(),
  skipped_dups: integer("skipped_dups").default(0).notNull(),
  started_at: timestamp("started_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  status: text("status").default("running").notNull(),
  succeeded: integer("succeeded").default(0).notNull(),
  total_scraped: integer("total_scraped").default(0).notNull(),
});

export const businessNotes = pgTable("business_notes", {
  business_id: integer("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  created_by: text("created_by").notNull(),
  deleted_at: timestamp("deleted_at", { mode: "date", withTimezone: true }),
  id: serial("id").primaryKey(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
});

export const userInvites = pgTable("user_invites", {
  deleted_at: timestamp("deleted_at", { mode: "date", withTimezone: true }),
  email: text("email").notNull().unique(),
  id: serial("id").primaryKey(),
  invited_at: timestamp("invited_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
});

export const approachLists = pgTable("approach_lists", {
  created_at: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  created_by: text("created_by").notNull(),
  deleted_at: timestamp("deleted_at", { mode: "date", withTimezone: true }),
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
});

export const approachListItems = pgTable(
  "approach_list_items",
  {
    added_at: timestamp("added_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
    business_id: integer("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    id: serial("id").primaryKey(),
    list_id: integer("list_id")
      .notNull()
      .references(() => approachLists.id, { onDelete: "cascade" }),
    note: text("note"),
  },
  (table) => {
    return [
      unique("approach_list_items_list_business_unique").on(table.list_id, table.business_id),
    ];
  },
);

// ── Read-only View ────────────────────────────────────────────────────────────

export const vBusinessesClassified = pgView("v_businesses_classified", {
  address: text("address"),
  business_name: text("business_name"),
  category: text("category"),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true }),
  district_city: text("district_city"),
  id: integer("id"),
  is_corrected: boolean("is_corrected"),
  maps_url: text("maps_url"),
  phone: text("phone"),
  rating: numeric("rating"),
  region: text("region"),
  review_count: integer("review_count"),
  review_image_urls: text("review_image_urls").array(),
  scraped_at: timestamp("scraped_at", { mode: "date", withTimezone: true }),
  search_keyword: text("search_keyword"),
  status: text("status"),
  ward_commune: text("ward_commune"),
  website: text("website"),
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
