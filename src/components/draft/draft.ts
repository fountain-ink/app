import type { Database } from "@/lib/db/database";
import type { Json } from "@/lib/db/database";
import { BlogData } from "@/lib/settings/get-blog-data";

export type Draft = Database["public"]["Tables"]["drafts"]["Row"] & {
  collectingSettings?: CollectingSettings;
  publishingSettings?: PublishingSettings;
  blogAddress?: string;
};

export interface PublishingSettings {
  sendNewsletter: boolean;
}

export interface CollectingSettings {
  isCollectingEnabled: boolean;
  collectingLicense: string;
  isChargeEnabled: boolean;
  price: string;
  currency: string;
  isReferralRewardsEnabled: boolean;
  referralPercent: number;
  isRevenueSplitEnabled: boolean;
  recipients: { address: string; percentage: number; username?: string | null; picture?: string | null }[];
  isLimitedEdition: boolean;
  collectLimit: number;
  isCollectExpiryEnabled: boolean;
  collectExpiryDays: number;
}
