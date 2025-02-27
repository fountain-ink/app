import type { Database } from "@/lib/supabase/database";
import type { Json } from "@/lib/supabase/database";

export type Draft = Database["public"]["Tables"]["drafts"]["Row"] & {
  collectingSettings?: {
    isCollectingEnabled: boolean;
    collectingLicense: string;
    isChargeEnabled: boolean;
    price: string;
    currency: string;
    isReferralRewardsEnabled: boolean;
    referralPercent: number;
    isRevenueSplitEnabled: boolean;
    recipients: { address: string; percent: number }[];
    isLimitedEdition: boolean;
    collectLimit: string;
    isCollectExpiryEnabled: boolean;
    collectExpiryDays: number;
    collectExpiryDate: string;
  };
  blogAddress?: string;
};
