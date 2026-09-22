import * as migration_20260922_220023 from './20260922_220023';

export const migrations = [
  {
    up: migration_20260922_220023.up,
    down: migration_20260922_220023.down,
    name: '20260922_220023'
  },
];
