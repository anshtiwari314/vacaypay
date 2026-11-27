import { useEffect, useRef, useState, type ReactNode } from "react";
import { TurboModuleRegistry } from "react-native";
import mobileAds, { useInterstitialAd } from "react-native-google-mobile-ads";

import { AdsContext } from "@/lib/ads-context";
import { BANNER_REFRESH_INTERVAL_MS, INTERSTITIAL_AD_UNIT_ID, INTERSTITIAL_INTERVAL_MS } from "@/lib/config";

function adsNativeLinked() {
  return TurboModuleRegistry.get("RNGoogleMobileAdsModule") != null;
}

function InterstitialScheduler({ enabled }: { enabled: boolean }) {
  const statusRef = useRef("idle");
  const { status, show, load } = useInterstitialAd({
    adUnitId: INTERSTITIAL_AD_UNIT_ID,
    autoLoad: enabled,
  });

  statusRef.current = status;

  useEffect(() => {
    if (status === "closed") load();
  }, [status, load]);

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => {
      if (statusRef.current === "loaded") show();
    }, INTERSTITIAL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [enabled, show]);

  return null;
}

export function AdsProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [bannerKey, setBannerKey] = useState(0);
  const linked = adsNativeLinked();

  useEffect(() => {
    if (!linked) return;
    let active = true;
    mobileAds()
      .initialize()
      .catch(() => undefined)
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [linked]);

  useEffect(() => {
    if (!ready) return;
    const id = setInterval(() => setBannerKey((key) => key + 1), BANNER_REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [ready]);

  return (
    <AdsContext.Provider value={{ ready: ready && linked, bannerKey }}>
      {ready && linked ? <InterstitialScheduler enabled /> : null}
      {children}
    </AdsContext.Provider>
  );
}