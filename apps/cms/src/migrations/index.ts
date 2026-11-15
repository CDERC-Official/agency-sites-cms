import * as migration_20260922_220023 from './20260922_220023';
import * as migration_20261109_121743_multi_tenant from './20261109_121743_multi_tenant';

export const migrations = [
  {
    up: migration_20260922_220023.up,
    down: migration_20260922_220023.down,
    name: '20260922_220023',
  },
  {
    up: migration_20261109_121743_multi_tenant.up,
    down: migration_20261109_121743_multi_tenant.down,
    name: '20261109_121743_multi_tenant'
  },
];
