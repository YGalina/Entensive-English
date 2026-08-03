import { Redirect } from "expo-router";
import { PRODUCT_ENTRY_ROUTE } from "@ie/core/routes";

export default function TabsLayout() {
  // The route group without a URL segment owns `/`. It is the legacy app shell,
  // not the product. Always hand startup to S1; S1 alone decides resume/onboarding.
  return <Redirect href={PRODUCT_ENTRY_ROUTE} />;
}
