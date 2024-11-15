"use client";

import { ReduxProvider } from "../store/provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return <ReduxProvider>{children}</ReduxProvider>;
}
