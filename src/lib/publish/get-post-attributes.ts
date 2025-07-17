import { MetadataAttributeType } from "@lens-protocol/metadata";
import type { Draft } from "@/components/draft/draft";

interface UploadPostMetadataArgs {
  draft: Draft;
  username: string;
}

export async function getPostAttributes({ draft }: UploadPostMetadataArgs): Promise<any[] | null> {
  const attributes: any[] = [
    { key: "contentJson", type: MetadataAttributeType.JSON, value: JSON.stringify(draft.contentJson) },
  ];

  if (draft.subtitle) {
    attributes.push({ key: "subtitle", type: MetadataAttributeType.STRING, value: draft.subtitle });
  }

  if (draft.coverUrl) {
    attributes.push({ key: "coverUrl", type: MetadataAttributeType.STRING, value: draft.coverUrl });
  }

  if (draft.slug) {
    attributes.push({ key: "slug", type: MetadataAttributeType.STRING, value: draft.slug });
  }

  if (draft.originalDate) {
    attributes.push({
      key: "originalDate",
      type: MetadataAttributeType.DATE,
      value: new Date(draft.originalDate).toISOString(),
    });
  }

  if (draft.canonicalUrl) {
    attributes.push({
      key: "canonicalUrl",
      type: MetadataAttributeType.STRING,
      value: draft.canonicalUrl,
    });
  }

  if (draft.collectingSettings?.collectingLicense) {
    attributes.push({
      key: "license",
      type: MetadataAttributeType.STRING,
      value: draft.collectingSettings.collectingLicense,
    });
  }

  if (draft.distributionSettings?.lensDisplay) {
    attributes.push({
      key: "lensDisplay",
      type: MetadataAttributeType.STRING,
      value: draft.distributionSettings.lensDisplay,
    });
  }

  return attributes;
}
