"use client";

import { ReduxProvider } from "@/store";

export function Providers({ children }: { children: React.ReactNode }) {
  return <ReduxProvider>{children}</ReduxProvider>;
}
