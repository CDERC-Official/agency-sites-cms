export function useSiteChrome() {
  const { getHeader, getFooter, getSiteSettings } = usePayload()

  return useAsyncData('site-chrome', async () => {
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
  })
}
