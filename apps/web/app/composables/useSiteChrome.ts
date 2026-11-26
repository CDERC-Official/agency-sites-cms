export function useSiteChrome() {
  const { getHeader, getFooter, getSiteSettings } = usePayload()
  const { locale } = useLocale()

  return useAsyncData(
    () => `site-chrome-${locale.value}`,
    async () => {
      const [header, footer, siteSettings] = await Promise.all([
        getHeader(),
        getFooter(),
        getSiteSettings(),
      ])

      return {
        header,
        footer,
        siteSettings,
      }
    },
    { watch: [locale] },
  )
}
