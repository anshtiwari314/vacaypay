import { Image } from "expo-image";

/** Official multicolor Google "G" (from Google brand assets). */
export function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <Image
      source={require("../../assets/images/google-g.png")}
      style={{ width: size, height: size }}
      contentFit="contain"
      accessibilityIgnoresInvertColors
    />
  );
}