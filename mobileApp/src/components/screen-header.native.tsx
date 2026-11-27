import type { ComponentProps } from "react";
import { View } from "react-native";

import { HeaderBanner } from "@/components/header-banner";
import { TopBar } from "@/components/ui";

export function ScreenHeader(props: ComponentProps<typeof TopBar>) {
  return (
    <View>
      <TopBar {...props} />
      <HeaderBanner />
    </View>
  );
}