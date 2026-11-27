import { createContext, useContext } from "react";

export type AdsContextValue = {
  ready: boolean;
  bannerKey: number;
};

const defaultValue: AdsContextValue = { ready: false, bannerKey: 0 };

export const AdsContext = createContext<AdsContextValue>(defaultValue);

export function useAds() {
  return useContext(AdsContext);
}