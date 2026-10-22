// 静态托管（GitHub Pages / OSS / `docusaurus serve`）对任意未命中的路径都只会
// 返回站点根目录的 404.html，而该文件是按默认语言（zh-Hans）预渲染的。
// 因此英文文档（/en/**）的 404 会显示中文提示，这里按 URL 判断实际语言。

export const SUPPORTED_LOCALES = ["en", "zh-Hans"];

const MESSAGES = {
  en: {
    title: "Page Not Found",
    p1: "We could not find what you were looking for.",
    p2: "Please contact the owner of the site that linked you to the original URL and let them know their link is broken.",
  },
  "zh-Hans": {
    title: "找不到页面",
    p1: "我们找不到您要找的页面。",
    p2: "请联系原始链接来源网站的所有者，并告知他们链接已损坏。",
  },
};

/**
 * Resolve the locale a 404 page should be rendered in.
 * The URL wins over the bundle locale so that the default-locale 404.html can
 * serve English pages living under `/en/`.
 */
export function resolveNotFoundLocale(pathname, baseUrl, bundleLocale) {
  const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const relative = pathname.startsWith(base)
    ? pathname.slice(base.length)
    : pathname.replace(/^\/+/, "");
  const [firstSegment] = relative.split("/");
  return SUPPORTED_LOCALES.includes(firstSegment) ? firstSegment : bundleLocale;
}

export function getNotFoundMessages(locale) {
  return MESSAGES[locale] ?? MESSAGES["zh-Hans"];
}
