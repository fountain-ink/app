import { Post, ArticleMetadata } from "@lens-protocol/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Licenses, LicenseDescriptions } from "@/lib/licenses";
import { ExternalLink, ScrollIcon, ScrollTextIcon } from "lucide-react";
import { InfoIcon } from "lucide-react";
import { resolveUrl } from "@/lib/utils/resolve-url";
import { Separator } from "../ui/separator";

interface PostMetadataProps {
  post: Post;
}

interface MetadataAttribute {
  key: string;
  value: string;
  type?: string;
}

enum ContentType {
  Grove = "Grove",
  Ipfs = "IPFS",
  Arweave = "Arweave",
  Other = "Other",
}

const resolveContentType = (contentUri: string) => {
  if (contentUri.startsWith("lens://")) {
    return ContentType.Grove;
  }

  if (contentUri.startsWith("ipfs://")) {
    return ContentType.Ipfs;
  }

  if (contentUri.startsWith("ar://")) {
    return ContentType.Arweave;
  }

  return ContentType.Other;
}

const getStorageTypeText = (storageType: ContentType) => {
  switch (storageType) {
    case ContentType.Grove:
      return "Grove hash";
    case ContentType.Ipfs:
      return "IPFS hash";
    case ContentType.Arweave:
      return "Arweave tx";
    default:
      return "Custom storage";
  }
}

const getStorageAboutLink = (storageType: ContentType): string | undefined => {
  switch (storageType) {
    case ContentType.Grove:
      return "https://lens.xyz/docs/storage";
    case ContentType.Ipfs:
      return "https://docs.ipfs.tech/";
    case ContentType.Arweave:
      return "https://docs.arweave.org/developers/mining/faqs";
    default:
      return undefined;
  }
}


export const PostMetadata = ({ post }: PostMetadataProps) => {
  let licenseValue: Licenses = Licenses.NoLicense;
  let licenseDescription = LicenseDescriptions[licenseValue];
  const storageType = resolveContentType(post.contentUri);

  const contentUri = post.contentUri;
  const resolvedUri = resolveUrl(contentUri);

  if (!post.metadata || typeof post.metadata !== 'object' || !('attributes' in post.metadata)) {
    return null
  }

  const attributes = post.metadata.attributes as MetadataAttribute[];
  const licenseAttribute = attributes.find((attr: MetadataAttribute) => attr.key === "license");

  if (licenseAttribute && licenseAttribute.value) {
    const potentialLicense = licenseAttribute.value as Licenses;

    if (potentialLicense in LicenseDescriptions) {
      licenseValue = potentialLicense;
      licenseDescription = LicenseDescriptions[licenseValue];
    } else {
      licenseDescription = "";
    }
  }

  return (
    <div className="w-full bg-card border border-border shadow-md rounded-lg p-4">
      <Tabs defaultValue="copyright-license">
        <TabsList>
          <TabsTrigger value="copyright-license">Copyright & License</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
        </TabsList>
        <TabsContent value="copyright-license">
          <div className="mt-4 flex flex-col gap-2 not-article ">
            <div className="flex flex-row items-center">
              <p className="!text-sm !text-muted-foreground">License</p>
              <a href={`https://lens.xyz/docs/protocol/best-practices/content-licensing#supported-licenses`} target="_blank" rel="noopener noreferrer" aria-label="About License">
                <InfoIcon className="h-3 w-3 ml-1 text-muted-foreground" />
              </a>
            </div>
            <Separator orientation="horizontal" />
            <div className="flex flex-row items-center gap-2 bg-muted rounded-md p-2">
              <p className="!text-sm !text-muted-foreground">
                <span className="!font-semibold">{licenseValue}{". "}</span>{licenseDescription && <span className="ml-1">{licenseDescription}</span>}
              </p>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="storage">
          <div className="mt-4 flex flex-col gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm flex flex-row items-center font-medium text-muted-foreground">
                {getStorageTypeText(storageType)}
                {getStorageAboutLink(storageType) && (
                  <a href={getStorageAboutLink(storageType)} target="_blank" rel="noopener noreferrer" aria-label="About Grove">
                    <InfoIcon className="h-3 w-3 ml-1" />
                  </a>
                )}
              </span>
            </div>
            <Separator orientation="horizontal" />
            {contentUri ? (
              <div className="flex items-center justify-between bg-muted p-2 pl-1.5 h-[36px] rounded-md">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span className="text-sm font-semibold bg-background/40 tracking-normal text-muted-foreground px-2 py-0.5 pr-1.5 rounded-sm shrink-0">
                    {contentUri.split('://')[0]}://
                  </span>
                  <span className="text-sm text-muted-foreground tracking-normal truncate min-w-0">
                    {contentUri.split('://')[1]}
                  </span>
                </div>
                <a
                  href={resolvedUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 p-1 hover:bg-muted-foreground/20 rounded-sm shrink-0"
                  aria-label="Open content in new tab"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                </a>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Storage URI not available.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 