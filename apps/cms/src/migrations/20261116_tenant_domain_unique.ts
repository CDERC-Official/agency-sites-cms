import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE UNIQUE INDEX IF NOT EXISTS "tenants_domain_idx" ON "tenants" USING btree ("domain");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP INDEX IF EXISTS "tenants_domain_idx";
  `)
}
