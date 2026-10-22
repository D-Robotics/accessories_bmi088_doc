import React from "react";
import Layout from "@theme/Layout";
import NotFoundContent from "@theme/NotFound/Content";

// Handles URLs outside the docs route tree. Missing URLs under the docs route
// tree are handled by @theme/DocRoot, which renders NotFoundContent directly.
export default function NotFound() {
  return (
    <Layout>
      <NotFoundContent />
    </Layout>
  );
}
