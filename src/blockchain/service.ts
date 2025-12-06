// src/blockchain/service.ts

import {
  BlockchainCertificateAsset,
  BlockchainApprovalUpdateOptions,
} from "./types";



export const API_BASE =
  import.meta.env.VITE_BLOCKCHAIN_API_BASE_URL ||
  "http://34.123.3.221:3000"; 

async function handleResponse(res: Response) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.success === false) {
    const msg =
      json?.error?.details ||
      json?.error?.message ||
      `Blockchain error: ${res.status}`;
    throw new Error(msg);
  }
  return json;
}

export async function fetchCertificateFromBlockchain(
  certificateId: string
): Promise<BlockchainCertificateAsset> {
  const res = await fetch(`${API_BASE}/api/assets/${certificateId}`, {
    method: "GET",
  });
  const json = await handleResponse(res);
  return json.data as BlockchainCertificateAsset;
}

export async function updateCertificateOnBlockchain(
  certificateId: string,
  asset: BlockchainCertificateAsset
): Promise<BlockchainCertificateAsset> {
  const res = await fetch(`${API_BASE}/api/assets/${certificateId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(asset),
  });
  const json = await handleResponse(res);
  return json.data as BlockchainCertificateAsset;
}
