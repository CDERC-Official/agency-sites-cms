import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TYPE "public"."enum_site_settings_local_business_opening_hours_days" AS ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');
  CREATE TYPE "public"."enum_site_settings_local_business_schema_type" AS ENUM('LocalBusiness', 'ProfessionalService', 'Store', 'Restaurant', 'MedicalBusiness', 'LegalService', 'HomeAndConstructionBusiness');

  CREATE TABLE "site_settings_local_business_opening_hours_days" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_site_settings_local_business_opening_hours_days",
  	"id" serial PRIMARY KEY NOT NULL
  );

  CREATE TABLE "site_settings_local_business_opening_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"opens" varchar NOT NULL,
  	"closes" varchar NOT NULL
  );

  CREATE TABLE "site_settings_local_business_same_as" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL
  );

  ALTER TABLE "site_settings" ADD COLUMN "local_business_schema_type" "enum_site_settings_local_business_schema_type" DEFAULT 'LocalBusiness';
  ALTER TABLE "site_settings" ADD COLUMN "local_business_street_address" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "local_business_address_locality" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "local_business_address_region" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "local_business_postal_code" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "local_business_address_country" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "local_business_latitude" numeric;
  ALTER TABLE "site_settings" ADD COLUMN "local_business_longitude" numeric;
  ALTER TABLE "site_settings" ADD COLUMN "local_business_price_range" varchar;

  ALTER TABLE "site_settings_local_business_opening_hours_days" ADD CONSTRAINT "site_settings_local_business_opening_hours_days_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_settings_local_business_opening_hours"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_local_business_opening_hours" ADD CONSTRAINT "site_settings_local_business_opening_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_local_business_same_as" ADD CONSTRAINT "site_settings_local_business_same_as_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;

  CREATE INDEX "site_settings_local_business_opening_hours_days_order_idx" ON "site_settings_local_business_opening_hours_days" USING btree ("order");
  CREATE INDEX "site_settings_local_business_opening_hours_days_parent_idx" ON "site_settings_local_business_opening_hours_days" USING btree ("parent_id");
  CREATE INDEX "site_settings_local_business_opening_hours_order_idx" ON "site_settings_local_business_opening_hours" USING btree ("_order");
  CREATE INDEX "site_settings_local_business_opening_hours_parent_id_idx" ON "site_settings_local_business_opening_hours" USING btree ("_parent_id");
  CREATE INDEX "site_settings_local_business_same_as_order_idx" ON "site_settings_local_business_same_as" USING btree ("_order");
  CREATE INDEX "site_settings_local_business_same_as_parent_id_idx" ON "site_settings_local_business_same_as" USING btree ("_parent_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "site_settings_local_business_opening_hours_days" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_local_business_opening_hours" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_local_business_same_as" DISABLE ROW LEVEL SECURITY;

  DROP TABLE "site_settings_local_business_opening_hours_days" CASCADE;
  DROP TABLE "site_settings_local_business_opening_hours" CASCADE;
  DROP TABLE "site_settings_local_business_same_as" CASCADE;

  ALTER TABLE "site_settings" DROP COLUMN "local_business_schema_type";
  ALTER TABLE "site_settings" DROP COLUMN "local_business_street_address";
  ALTER TABLE "site_settings" DROP COLUMN "local_business_address_locality";
  ALTER TABLE "site_settings" DROP COLUMN "local_business_address_region";
  ALTER TABLE "site_settings" DROP COLUMN "local_business_postal_code";
  ALTER TABLE "site_settings" DROP COLUMN "local_business_address_country";
  ALTER TABLE "site_settings" DROP COLUMN "local_business_latitude";
  ALTER TABLE "site_settings" DROP COLUMN "local_business_longitude";
  ALTER TABLE "site_settings" DROP COLUMN "local_business_price_range";

  DROP TYPE "public"."enum_site_settings_local_business_opening_hours_days";
  DROP TYPE "public"."enum_site_settings_local_business_schema_type";
  `)
}
