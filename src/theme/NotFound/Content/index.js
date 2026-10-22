import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { useLocation } from "@docusaurus/router";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { PageMetadata } from "@docusaurus/theme-common";
import Heading from "@theme/Heading";
import {
  getNotFoundMessages,
  resolveNotFoundLocale,
} from "@site/src/utils/notfound-locale";

// This component is rendered in two places:
// - @theme/NotFound, for URLs outside the docs route tree
// - @theme/DocRoot, when a URL under the docs route tree matches no document
// DocRoot renders it without props, so it resolves the locale on its own.
export default function NotFoundContent({ className, locale: localeProp }) {
  const { i18n, siteConfig } = useDocusaurusContext();
  const { pathname } = useLocation();
  const buildLocale =
    siteConfig.customFields?.buildLocale ?? i18n.currentLocale;
  const resolvedLocale =
    localeProp ??
    resolveNotFoundLocale(pathname, siteConfig.baseUrl, buildLocale);

  // Docusaurus renders the docs 404 route with the default-locale context
  // during SSG, so resolve the locale from the URL/build locale. On the client,
  // start from the bundle locale to keep hydration consistent, then switch to
  // the locale inferred from the actual URL (the root 404.html is also served
  // for missing /en/** paths).
  const [locale, setLocale] = useState(
    typeof window === "undefined" ? resolvedLocale : i18n.currentLocale,
  );
  useEffect(() => {
    setLocale(resolvedLocale);
  }, [resolvedLocale]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const { title, p1, p2 } = getNotFoundMessages(locale);

  return (
    <>
      <PageMetadata title={title} />
      <main className={clsx("container margin-vert--xl", className)}>
        <div className="row">
          <div className="col col--6 col--offset-3">
            <Heading as="h1" className="hero__title">
              {title}
            </Heading>
            <p>{p1}</p>
            <p>{p2}</p>
          </div>
        </div>
      </main>
    </>
  );
}
