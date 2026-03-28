import type { Metadata } from "next";
import type { ReactElement } from "react";

import { ApiDemoClient } from "@/app/api-demo/api-demo-client";

export const metadata: Metadata = {
  title: "API demo — Chat app",
  description:
    "Example REST calls to the NestJS backend (health + products CRUD).",
};

export default function ApiDemoPage(): ReactElement {
  return <ApiDemoClient />;
}
