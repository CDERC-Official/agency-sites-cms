export const sharedNuxtConfig = {
  typescript: {
    strict: true,
    tsConfig: {
      compilerOptions: {
        noUncheckedIndexedAccess: true,
        skipLibCheck: true,
      },
    },
  },
}
