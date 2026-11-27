import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { StyleSheet, View } from "react-native";

import { BANNER_AD_UNIT_ID } from "@/lib/config";
import { useAds } from "@/lib/ads-context";

/** Short banner under the VacayPay / Sign out row. Remounts every 3.5 minutes for a fresh ad. */
export function HeaderBanner() {
  const { ready, bannerKey } = useAds();
  if (!ready) return null;

  return (
    <View style={styles.wrap}>
      <BannerAd
        key={bannerKey}
        unitId={BANNER_AD_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 4,
    minHeight: 50,
  },
});