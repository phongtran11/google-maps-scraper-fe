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
  phone: text("phone"),
  rating: numeric("rating"),
  region: text("region"),
  reviewCount: integer("review_count"),
  reviewImageUrls: text("review_image_urls")
    .array()
    .default(sql`'{}'::TEXT[]`),
  scrapedAt: timestamp("scraped_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  searchKeyword: text("search_keyword").notNull(),
  status: text("status").default("new").notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  wardId: integer("ward_id").references(() => wards.id, { onDelete: "set null" }),
  website: text("website"),
});

export const districts = pgTable("districts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const wards = pgTable(
  "wards",
  {
    districtId: integer("district_id")
      .notNull()
      .references(() => districts.id, { onDelete: "cascade" }),
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
  },
  (table) => {
    return [unique("wards_name_district_unique").on(table.name, table.districtId)];
  },
);

export const scrapeRuns = pgTable("scrape_runs", {
  durationMs: bigint("duration_ms", { mode: "bigint" })
    .default(sql`0`)
    .notNull(),
  errors: text("errors")
    .array()
    .default(sql`'{}'::TEXT[]`),
  failed: integer("failed").default(0).notNull(),
  finishedAt: timestamp("finished_at", { mode: "date", withTimezone: true }),
  id: serial("id").primaryKey(),
  keyword: text("keyword").notNull(),
  listingsFound: integer("listings_found").default(0).notNull(),
  skippedDups: integer("skipped_dups").default(0).notNull(),
  startedAt: timestamp("started_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  status: text("status").default("running").notNull(),
  succeeded: integer("succeeded").default(0).notNull(),
  totalScraped: integer("total_scraped").default(0).notNull(),
});

export const businessNotes = pgTable("business_notes", {
  businessId: integer("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  createdBy: text("created_by").notNull(),
  deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
  id: serial("id").primaryKey(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
});

export const userInvites = pgTable("user_invites", {
  deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
  email: text("email").notNull().unique(),
  id: serial("id").primaryKey(),
  invitedAt: timestamp("invited_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
});

export const approachLists = pgTable("approach_lists", {
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  createdBy: text("created_by").notNull(),
  deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
});

export const approachListItems = pgTable(
  "approach_list_items",
  {
    addedAt: timestamp("added_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
    businessId: integer("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    id: serial("id").primaryKey(),
    listId: integer("list_id")
      .notNull()
      .references(() => approachLists.id, { onDelete: "cascade" }),
    note: text("note"),
  },
  (table) => {
    return [unique("approach_list_items_list_business_unique").on(table.listId, table.businessId)];
  },
);

// ── Read-only View ────────────────────────────────────────────────────────────

export const vBusinessesClassified = pgView("v_businesses_classified", {
  address: text("address"),
  businessName: text("business_name"),
  category: text("category"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }),
  districtCity: text("district_city"),
  id: integer("id"),
  isCorrected: boolean("is_corrected"),
  mapsUrl: text("maps_url"),
  phone: text("phone"),
  rating: numeric("rating"),
  region: text("region"),
  reviewCount: integer("review_count"),
  reviewImageUrls: text("review_image_urls").array(),
  scrapedAt: timestamp("scraped_at", { mode: "date", withTimezone: true }),
  searchKeyword: text("search_keyword"),
  status: text("status"),
  wardCommune: text("ward_commune"),
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
