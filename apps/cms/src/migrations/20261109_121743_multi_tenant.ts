import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TYPE "public"."enum_users_roles" AS ENUM('super-admin', 'user');
  CREATE TYPE "public"."enum_users_tenants_roles" AS ENUM('tenant-admin', 'tenant-viewer');
  CREATE TABLE "users_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );

  CREATE TABLE "users_tenants_roles" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_users_tenants_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );

  CREATE TABLE "users_tenants" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tenant_id" integer NOT NULL
  );

  CREATE TABLE "tenants" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"domain" varchar,
  	"slug" varchar NOT NULL,
  	"allow_public_read" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  DROP INDEX IF EXISTS "pages_slug_idx";
  DROP INDEX IF EXISTS "posts_slug_idx";
  DROP INDEX IF EXISTS "categories_slug_idx";

  UPDATE "header" SET "updated_at" = now() WHERE "updated_at" IS NULL;
  UPDATE "header" SET "created_at" = now() WHERE "created_at" IS NULL;
  ALTER TABLE "header" ALTER COLUMN "updated_at" SET DEFAULT now();
  ALTER TABLE "header" ALTER COLUMN "updated_at" SET NOT NULL;
  ALTER TABLE "header" ALTER COLUMN "created_at" SET DEFAULT now();
  ALTER TABLE "header" ALTER COLUMN "created_at" SET NOT NULL;

  UPDATE "footer" SET "updated_at" = now() WHERE "updated_at" IS NULL;
  UPDATE "footer" SET "created_at" = now() WHERE "created_at" IS NULL;
  ALTER TABLE "footer" ALTER COLUMN "updated_at" SET DEFAULT now();
  ALTER TABLE "footer" ALTER COLUMN "updated_at" SET NOT NULL;
  ALTER TABLE "footer" ALTER COLUMN "created_at" SET DEFAULT now();
  ALTER TABLE "footer" ALTER COLUMN "created_at" SET NOT NULL;

  UPDATE "site_settings" SET "updated_at" = now() WHERE "updated_at" IS NULL;
  UPDATE "site_settings" SET "created_at" = now() WHERE "created_at" IS NULL;
  ALTER TABLE "site_settings" ALTER COLUMN "updated_at" SET DEFAULT now();
  ALTER TABLE "site_settings" ALTER COLUMN "updated_at" SET NOT NULL;
  ALTER TABLE "site_settings" ALTER COLUMN "created_at" SET DEFAULT now();
  ALTER TABLE "site_settings" ALTER COLUMN "created_at" SET NOT NULL;

  ALTER TABLE "pages" ADD COLUMN "tenant_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_tenant_id" integer;
  ALTER TABLE "posts" ADD COLUMN "tenant_id" integer;
  ALTER TABLE "_posts_v" ADD COLUMN "version_tenant_id" integer;
  ALTER TABLE "media" ADD COLUMN "tenant_id" integer;
  ALTER TABLE "categories" ADD COLUMN "tenant_id" integer;
  ALTER TABLE "redirects" ADD COLUMN "tenant_id" integer;
  ALTER TABLE "forms" ADD COLUMN "tenant_id" integer;
  ALTER TABLE "form_submissions" ADD COLUMN "tenant_id" integer;
  ALTER TABLE "search" ADD COLUMN "tenant_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "tenants_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "site_settings_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "header_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "footer_id" integer;
  ALTER TABLE "header" ADD COLUMN "tenant_id" integer;
  ALTER TABLE "footer" ADD COLUMN "tenant_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "tenant_id" integer;

  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_tenants_roles" ADD CONSTRAINT "users_tenants_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users_tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_tenants" ADD CONSTRAINT "users_tenants_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_tenants" ADD CONSTRAINT "users_tenants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;

  CREATE INDEX "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  CREATE INDEX "users_tenants_roles_order_idx" ON "users_tenants_roles" USING btree ("order");
  CREATE INDEX "users_tenants_roles_parent_idx" ON "users_tenants_roles" USING btree ("parent_id");
  CREATE INDEX "users_tenants_order_idx" ON "users_tenants" USING btree ("_order");
  CREATE INDEX "users_tenants_parent_id_idx" ON "users_tenants" USING btree ("_parent_id");
  CREATE INDEX "users_tenants_tenant_idx" ON "users_tenants" USING btree ("tenant_id");
  CREATE INDEX "tenants_slug_idx" ON "tenants" USING btree ("slug");
  CREATE INDEX "tenants_allow_public_read_idx" ON "tenants" USING btree ("allow_public_read");
  CREATE INDEX "tenants_updated_at_idx" ON "tenants" USING btree ("updated_at");
  CREATE INDEX "tenants_created_at_idx" ON "tenants" USING btree ("created_at");
  CREATE UNIQUE INDEX "site_settings_tenant_idx" ON "site_settings" USING btree ("tenant_id");
  CREATE INDEX "site_settings_updated_at_idx" ON "site_settings" USING btree ("updated_at");
  CREATE INDEX "site_settings_created_at_idx" ON "site_settings" USING btree ("created_at");

  ALTER TABLE "pages" ADD CONSTRAINT "pages_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "redirects" ADD CONSTRAINT "redirects_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "forms" ADD CONSTRAINT "forms_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "search" ADD CONSTRAINT "search_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tenants_fk" FOREIGN KEY ("tenants_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_site_settings_fk" FOREIGN KEY ("site_settings_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_header_fk" FOREIGN KEY ("header_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_footer_fk" FOREIGN KEY ("footer_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header" ADD CONSTRAINT "header_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer" ADD CONSTRAINT "footer_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;

  CREATE INDEX "pages_tenant_idx" ON "pages" USING btree ("tenant_id");
  CREATE INDEX "_pages_v_version_version_tenant_idx" ON "_pages_v" USING btree ("version_tenant_id");
  CREATE INDEX "posts_tenant_idx" ON "posts" USING btree ("tenant_id");
  CREATE INDEX "_posts_v_version_version_tenant_idx" ON "_posts_v" USING btree ("version_tenant_id");
  CREATE INDEX "media_tenant_idx" ON "media" USING btree ("tenant_id");
  CREATE INDEX "categories_tenant_idx" ON "categories" USING btree ("tenant_id");
  CREATE INDEX "redirects_tenant_idx" ON "redirects" USING btree ("tenant_id");
  CREATE INDEX "forms_tenant_idx" ON "forms" USING btree ("tenant_id");
  CREATE INDEX "form_submissions_tenant_idx" ON "form_submissions" USING btree ("tenant_id");
  CREATE INDEX "search_tenant_idx" ON "search" USING btree ("tenant_id");
  CREATE INDEX "payload_locked_documents_rels_tenants_id_idx" ON "payload_locked_documents_rels" USING btree ("tenants_id");
  CREATE INDEX "payload_locked_documents_rels_site_settings_id_idx" ON "payload_locked_documents_rels" USING btree ("site_settings_id");
  CREATE INDEX "payload_locked_documents_rels_header_id_idx" ON "payload_locked_documents_rels" USING btree ("header_id");
  CREATE INDEX "payload_locked_documents_rels_footer_id_idx" ON "payload_locked_documents_rels" USING btree ("footer_id");
  CREATE UNIQUE INDEX "header_tenant_idx" ON "header" USING btree ("tenant_id");
  CREATE INDEX "header_updated_at_idx" ON "header" USING btree ("updated_at");
  CREATE INDEX "header_created_at_idx" ON "header" USING btree ("created_at");
  CREATE UNIQUE INDEX "footer_tenant_idx" ON "footer" USING btree ("tenant_id");
  CREATE INDEX "footer_updated_at_idx" ON "footer" USING btree ("updated_at");
  CREATE INDEX "footer_created_at_idx" ON "footer" USING btree ("created_at");
  CREATE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "pages" DROP CONSTRAINT IF EXISTS "pages_tenant_id_tenants_id_fk";
  ALTER TABLE "_pages_v" DROP CONSTRAINT IF EXISTS "_pages_v_version_tenant_id_tenants_id_fk";
  ALTER TABLE "posts" DROP CONSTRAINT IF EXISTS "posts_tenant_id_tenants_id_fk";
  ALTER TABLE "_posts_v" DROP CONSTRAINT IF EXISTS "_posts_v_version_tenant_id_tenants_id_fk";
  ALTER TABLE "media" DROP CONSTRAINT IF EXISTS "media_tenant_id_tenants_id_fk";
  ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "categories_tenant_id_tenants_id_fk";
  ALTER TABLE "header" DROP CONSTRAINT IF EXISTS "header_tenant_id_tenants_id_fk";
  ALTER TABLE "footer" DROP CONSTRAINT IF EXISTS "footer_tenant_id_tenants_id_fk";
  ALTER TABLE "site_settings" DROP CONSTRAINT IF EXISTS "site_settings_tenant_id_tenants_id_fk";
  ALTER TABLE "redirects" DROP CONSTRAINT IF EXISTS "redirects_tenant_id_tenants_id_fk";
  ALTER TABLE "forms" DROP CONSTRAINT IF EXISTS "forms_tenant_id_tenants_id_fk";
  ALTER TABLE "form_submissions" DROP CONSTRAINT IF EXISTS "form_submissions_tenant_id_tenants_id_fk";
  ALTER TABLE "search" DROP CONSTRAINT IF EXISTS "search_tenant_id_tenants_id_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_tenants_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_site_settings_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_header_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_footer_fk";

  DROP INDEX IF EXISTS "pages_tenant_idx";
  DROP INDEX IF EXISTS "_pages_v_version_version_tenant_idx";
  DROP INDEX IF EXISTS "posts_tenant_idx";
  DROP INDEX IF EXISTS "_posts_v_version_version_tenant_idx";
  DROP INDEX IF EXISTS "media_tenant_idx";
  DROP INDEX IF EXISTS "categories_tenant_idx";
  DROP INDEX IF EXISTS "header_tenant_idx";
  DROP INDEX IF EXISTS "header_updated_at_idx";
  DROP INDEX IF EXISTS "header_created_at_idx";
  DROP INDEX IF EXISTS "footer_tenant_idx";
  DROP INDEX IF EXISTS "footer_updated_at_idx";
  DROP INDEX IF EXISTS "footer_created_at_idx";
  DROP INDEX IF EXISTS "site_settings_tenant_idx";
  DROP INDEX IF EXISTS "site_settings_updated_at_idx";
  DROP INDEX IF EXISTS "site_settings_created_at_idx";
  DROP INDEX IF EXISTS "redirects_tenant_idx";
  DROP INDEX IF EXISTS "forms_tenant_idx";
  DROP INDEX IF EXISTS "form_submissions_tenant_idx";
  DROP INDEX IF EXISTS "search_tenant_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_tenants_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_site_settings_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_header_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_footer_id_idx";
  DROP INDEX IF EXISTS "pages_slug_idx";
  DROP INDEX IF EXISTS "posts_slug_idx";
  DROP INDEX IF EXISTS "categories_slug_idx";

  ALTER TABLE "header" ALTER COLUMN "updated_at" DROP DEFAULT;
  ALTER TABLE "header" ALTER COLUMN "updated_at" DROP NOT NULL;
  ALTER TABLE "header" ALTER COLUMN "created_at" DROP DEFAULT;
  ALTER TABLE "header" ALTER COLUMN "created_at" DROP NOT NULL;
  ALTER TABLE "footer" ALTER COLUMN "updated_at" DROP DEFAULT;
  ALTER TABLE "footer" ALTER COLUMN "updated_at" DROP NOT NULL;
  ALTER TABLE "footer" ALTER COLUMN "created_at" DROP DEFAULT;
  ALTER TABLE "footer" ALTER COLUMN "created_at" DROP NOT NULL;
  ALTER TABLE "site_settings" ALTER COLUMN "updated_at" DROP DEFAULT;
  ALTER TABLE "site_settings" ALTER COLUMN "updated_at" DROP NOT NULL;
  ALTER TABLE "site_settings" ALTER COLUMN "created_at" DROP DEFAULT;
  ALTER TABLE "site_settings" ALTER COLUMN "created_at" DROP NOT NULL;

  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");

  ALTER TABLE "pages" DROP COLUMN IF EXISTS "tenant_id";
  ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_tenant_id";
  ALTER TABLE "posts" DROP COLUMN IF EXISTS "tenant_id";
  ALTER TABLE "_posts_v" DROP COLUMN IF EXISTS "version_tenant_id";
  ALTER TABLE "media" DROP COLUMN IF EXISTS "tenant_id";
  ALTER TABLE "categories" DROP COLUMN IF EXISTS "tenant_id";
  ALTER TABLE "header" DROP COLUMN IF EXISTS "tenant_id";
  ALTER TABLE "footer" DROP COLUMN IF EXISTS "tenant_id";
  ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "tenant_id";
  ALTER TABLE "redirects" DROP COLUMN IF EXISTS "tenant_id";
  ALTER TABLE "forms" DROP COLUMN IF EXISTS "tenant_id";
  ALTER TABLE "form_submissions" DROP COLUMN IF EXISTS "tenant_id";
  ALTER TABLE "search" DROP COLUMN IF EXISTS "tenant_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "tenants_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "site_settings_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "header_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "footer_id";

  DROP TABLE IF EXISTS "users_roles" CASCADE;
  DROP TABLE IF EXISTS "users_tenants_roles" CASCADE;
  DROP TABLE IF EXISTS "users_tenants" CASCADE;
  DROP TABLE IF EXISTS "tenants" CASCADE;
  DROP TYPE IF EXISTS "public"."enum_users_roles";
  DROP TYPE IF EXISTS "public"."enum_users_tenants_roles";
  `)
}
