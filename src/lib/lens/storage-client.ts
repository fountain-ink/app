import { StorageClient, staging, production } from "@lens-chain/storage-client";

export const storageClient = StorageClient.create(production);
