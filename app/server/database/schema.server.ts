import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  serial,
  unique,
  bigint,
  pgView,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ── Better Auth Tables (camelCase columns in Postgres) ────────────────────────

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt", { withTimezone: true, mode: "date" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" }).notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt", {
    withTimezone: true,
    mode: "date",
  }),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt", {
    withTimezone: true,
    mode: "date",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" }).notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt", { withTimezone: true, mode: "date" }).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});

// ── Application Tables (snake_case columns in Postgres) ────────────────────────

export const districts = pgTable("districts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const wards = pgTable(
  "wards",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    district_id: integer("district_id")
      .notNull()
      .references(() => districts.id, { onDelete: "cascade" }),
  },
  (table) => {
    return [unique("wards_name_district_unique").on(table.name, table.district_id)];
  },
);

export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  search_keyword: text("search_keyword").notNull(),
  business_name: text("business_name"),
  phone: text("phone"),
  website: text("website"),
  address: text("address"),
  category: text("category"),
  region: text("region"),
  rating: numeric("rating"),
  review_count: integer("review_count"),
  image_review_count: integer("image_review_count").default(0),
  maps_url: text("maps_url").notNull().unique(),
  review_image_urls: text("review_image_urls")
    .array()
    .default(sql`'{}'::TEXT[]`),
  status: text("status").default("new").notNull(),
  scraped_at: timestamp("scraped_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  created_at: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  is_corrected: boolean("is_corrected").default(true),
  ward_id: integer("ward_id").references(() => wards.id, { onDelete: "set null" }),
});

export const scrapeRuns = pgTable("scrape_runs", {
  id: serial("id").primaryKey(),
  keyword: text("keyword").notNull(),
  started_at: timestamp("started_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  finished_at: timestamp("finished_at", { withTimezone: true, mode: "date" }),
  listings_found: integer("listings_found").default(0).notNull(),
  total_scraped: integer("total_scraped").default(0).notNull(),
  succeeded: integer("succeeded").default(0).notNull(),
  failed: integer("failed").default(0).notNull(),
  skipped_dups: integer("skipped_dups").default(0).notNull(),
  duration_ms: bigint("duration_ms", { mode: "bigint" })
    .default(sql`0`)
    .notNull(),
  errors: text("errors")
    .array()
    .default(sql`'{}'::TEXT[]`),
  status: text("status").default("running").notNull(),
});

export const businessNotes = pgTable("business_notes", {
  id: serial("id").primaryKey(),
  business_id: integer("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  created_by: text("created_by").notNull(),
  created_at: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  deleted_at: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
});

export const userInvites = pgTable("user_invites", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  invited_at: timestamp("invited_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});

// ── Read-only View ────────────────────────────────────────────────────────────

export const vBusinessesClassified = pgView("v_businesses_classified", {
  id: integer("id"),
  search_keyword: text("search_keyword"),
  business_name: text("business_name"),
  phone: text("phone"),
  website: text("website"),
  address: text("address"),
  category: text("category"),
  region: text("region"),
  rating: numeric("rating"),
  review_count: integer("review_count"),
  maps_url: text("maps_url"),
  review_image_urls: text("review_image_urls").array(),
  status: text("status"),
  scraped_at: timestamp("scraped_at", { withTimezone: true, mode: "date" }),
  created_at: timestamp("created_at", { withTimezone: true, mode: "date" }),
  is_corrected: boolean("is_corrected"),
  ward_commune: text("ward_commune"),
  district_city: text("district_city"),
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
