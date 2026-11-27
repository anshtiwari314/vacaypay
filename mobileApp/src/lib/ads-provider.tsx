import type { ReactNode } from "react";

import { AdsContext } from "@/lib/ads-context";

export function AdsProvider({ children }: { children: ReactNode }) {
  return <AdsContext.Provider value={{ ready: false, bannerKey: 0 }}>{children}</AdsContext.Provider>;
}