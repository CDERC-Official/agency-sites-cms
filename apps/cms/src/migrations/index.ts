import * as migration_20260922_220023 from './20260922_220023';
import * as migration_20261109_121743_multi_tenant from './20261109_121743_multi_tenant';
import * as migration_20261116_tenant_domain_unique from './20261116_tenant_domain_unique';
import * as migration_20261125_225329_local_business_jsonld from './20261125_225329_local_business_jsonld';
import * as migration_20261126_220429_localization from './20261126_220429_localization';
import * as migration_20261126_222423_tenant_locales from './20261126_222423_tenant_locales';
import * as migration_20261126_224700_rename_tenant_enabled_locales from './20261126_224700_rename_tenant_enabled_locales';

export const migrations = [
  {
    up: migration_20260922_220023.up,
    down: migration_20260922_220023.down,
    name: '20260922_220023',
  },
  {
    up: migration_20261109_121743_multi_tenant.up,
    down: migration_20261109_121743_multi_tenant.down,
    name: '20261109_121743_multi_tenant',
  },
  {
    up: migration_20261116_tenant_domain_unique.up,
    down: migration_20261116_tenant_domain_unique.down,
    name: '20261116_tenant_domain_unique',
  },
  {
    up: migration_20261125_225329_local_business_jsonld.up,
    down: migration_20261125_225329_local_business_jsonld.down,
    name: '20261125_225329_local_business_jsonld',
  },
  {
    up: migration_20261126_220429_localization.up,
    down: migration_20261126_220429_localization.down,
    name: '20261126_220429_localization',
  },
  {
    up: migration_20261126_222423_tenant_locales.up,
    down: migration_20261126_222423_tenant_locales.down,
    name: '20261126_222423_tenant_locales',
  },
  {
    up: migration_20261126_224700_rename_tenant_enabled_locales.up,
    down: migration_20261126_224700_rename_tenant_enabled_locales.down,
    name: '20261126_224700_rename_tenant_enabled_locales',
  },
];
