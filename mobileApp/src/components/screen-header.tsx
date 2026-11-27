import { TopBar } from "@/components/ui";
import type { ComponentProps } from "react";

export function ScreenHeader(props: ComponentProps<typeof TopBar>) {
  return <TopBar {...props} />;
}