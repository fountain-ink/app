import { z } from "zod";
import type { Database } from "@/lib/db/database";
import { detailsFormSchema } from "../publish/publish-details-tab";
import { distributionFormSchema } from "../publish/publish-distribution-tab";
import { collectingFormSchema } from "../publish/publish-monetization-tab";

export type DraftDetailsFormValues = z.infer<typeof detailsFormSchema>;
export type DraftDistributionFormValues = z.infer<typeof distributionFormSchema>;
export type DraftCollectingFormValues = z.infer<typeof collectingFormSchema>;

export type Draft = Database["public"]["Tables"]["drafts"]["Row"] & {
  title: string;
  subtitle: string | null;
  coverUrl: string | null;
  slug: string | null;
  tags: string[];
  images: string[];
  originalDate: Date | null;
  isMiscSectionExpanded: boolean;
  wasPublishedBefore: boolean;
  canonicalUrl: string | null;

  distributionSettings: DraftDistributionFormValues;
  collectingSettings: DraftCollectingFormValues;

  published_id?: string;
};
