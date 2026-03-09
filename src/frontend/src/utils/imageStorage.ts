import { HttpAgent } from "@icp-sdk/core/agent";
import type { Identity } from "@icp-sdk/core/agent";
import { loadConfig } from "../config";
import { StorageClient } from "./StorageClient";

async function createStorageClient(
  identity?: Identity,
): Promise<StorageClient> {
  const config = await loadConfig();
  const agent = await HttpAgent.create({
    identity: identity,
    host: config.backend_host,
  });
  return new StorageClient(
    config.bucket_name,
    config.storage_gateway_url,
    config.backend_canister_id,
    config.project_id,
    agent,
  );
}

export async function uploadImage(
  file: File,
  identity: Identity,
  onProgress?: (pct: number) => void,
): Promise<string> {
  const client = await createStorageClient(identity);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { hash } = await client.putFile(bytes, onProgress);
  return hash;
}

export async function getImageUrl(
  hash: string,
  identity?: Identity,
): Promise<string> {
  const client = await createStorageClient(identity);
  return client.getDirectURL(hash);
}
