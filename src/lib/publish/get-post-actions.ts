import { dateTime, evmAddress } from "@lens-protocol/client";
import type { CollectingFormValues } from "@/components/publish/publish-monetization-tab";

export function getPostActions(collectingSettings: CollectingFormValues | undefined, address: string) {
  if (!collectingSettings?.isCollectingEnabled) {
    return undefined;
  }

  const payToCollectConfig =
    collectingSettings?.isChargeEnabled && collectingSettings.price
      ? {
          native: collectingSettings.price,
          ...(collectingSettings.isReferralRewardsEnabled ? { referralShare: collectingSettings.referralPercent } : {}),
          recipients:
            collectingSettings.isRevenueSplitEnabled && collectingSettings.recipients.length > 0
              ? collectingSettings.recipients.map((r) => ({
                  address: evmAddress(r.address),
                  percent: r.percentage,
                }))
              : [
                  {
                    address: evmAddress(address),
                    percent: 100,
                  },
                ],
        }
      : undefined;

  const actions = collectingSettings?.isCollectingEnabled
    ? [
        {
          simpleCollect: {
            ...(collectingSettings.isLimitedEdition && collectingSettings.collectLimit
              ? { collectLimit: Number(collectingSettings.collectLimit) }
              : undefined),
            ...(collectingSettings.isCollectExpiryEnabled && collectingSettings.collectExpiryDays
              ? {
                  endsAt: dateTime(
                    new Date(Date.now() + collectingSettings.collectExpiryDays * 24 * 60 * 60 * 1000).toISOString(),
                  ),
                }
              : undefined),
            ...(payToCollectConfig ? { payToCollect: payToCollectConfig } : undefined),
          },
        },
      ]
    : undefined;

  console.log("actions", actions);

  return actions;
}
