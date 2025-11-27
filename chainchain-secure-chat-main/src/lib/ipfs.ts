import { EncryptedBundle } from "./crypto";

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || "https://gateway.pinata.cloud/ipfs/";

export async function uploadToIPFS(bundle: EncryptedBundle): Promise<string> {
  if (!PINATA_JWT) {
    throw new Error("Pinata JWT not found in .env");
  }

  const blob = new Blob([JSON.stringify(bundle)], { type: "application/json" });
  const formData = new FormData();
  formData.append("file", blob, "message.json");

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Failed to upload to IPFS: ${res.statusText}`);
  }

  const data = await res.json();
  return data.IpfsHash;
}

export async function fetchFromIPFS(cid: string): Promise<EncryptedBundle> {
  // Try the primary gateway
  const res = await fetch(`${GATEWAY_URL}${cid}`);
  
  if (!res.ok) {
    // Fallback to public ipfs.io if Pinata gateway is slow/rate-limited
    const fallbackRes = await fetch(`https://ipfs.io/ipfs/${cid}`);
    if (!fallbackRes.ok) throw new Error("Failed to fetch from IPFS");
    return fallbackRes.json();
  }

  return res.json();
}