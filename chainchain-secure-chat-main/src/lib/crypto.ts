// Cryptographic utilities for ChainChain
// Uses Web Crypto API for AES-GCM and RSA-OAEP encryption

// Generate a random AES-256 key
export async function generateAESKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

// Export AES key to raw bytes
export async function exportAESKey(key: CryptoKey): Promise<ArrayBuffer> {
  return await crypto.subtle.exportKey("raw", key);
}

// Import AES key from raw bytes
export async function importAESKey(keyData: ArrayBuffer): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

// Encrypt data with AES-GCM
export async function encryptAES(
  key: CryptoKey,
  data: string
): Promise<{ ciphertext: ArrayBuffer; iv: Uint8Array }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: new Uint8Array(iv) },
    key,
    encodedData
  );

  return { ciphertext, iv };
}

// Decrypt data with AES-GCM
export async function decryptAES(
  key: CryptoKey,
  ciphertext: ArrayBuffer,
  iv: Uint8Array
): Promise<string> {
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(iv) },
    key,
    ciphertext
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

// Generate RSA key pair for asymmetric encryption
export async function generateRSAKeyPair(): Promise<CryptoKeyPair> {
  return await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );
}

// Export RSA public key to base64
export async function exportPublicKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey("spki", key);
  return arrayBufferToBase64(exported);
}

// Export RSA private key to base64
export async function exportPrivateKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey("pkcs8", key);
  return arrayBufferToBase64(exported);
}

// Import RSA public key from base64
export async function importPublicKey(keyBase64: string): Promise<CryptoKey> {
  const keyData = base64ToArrayBuffer(keyBase64);
  return await crypto.subtle.importKey(
    "spki",
    keyData,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["encrypt"]
  );
}

// Import RSA private key from base64
export async function importPrivateKey(keyBase64: string): Promise<CryptoKey> {
  const keyData = base64ToArrayBuffer(keyBase64);
  return await crypto.subtle.importKey(
    "pkcs8",
    keyData,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["decrypt"]
  );
}

// Encrypt AES key with RSA public key
export async function encryptWithPublicKey(
  publicKey: CryptoKey,
  data: ArrayBuffer
): Promise<ArrayBuffer> {
  return await crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, data);
}

// Decrypt AES key with RSA private key
export async function decryptWithPrivateKey(
  privateKey: CryptoKey,
  data: ArrayBuffer
): Promise<ArrayBuffer> {
  return await crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, data);
}

// Utility: ArrayBuffer to Base64
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Utility: Base64 to ArrayBuffer
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer.slice(0) as ArrayBuffer;
}

// Utility: Uint8Array to Base64
export function uint8ArrayToBase64(arr: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < arr.byteLength; i++) {
    binary += String.fromCharCode(arr[i]);
  }
  return btoa(binary);
}

// Utility: Base64 to Uint8Array
export function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Create encrypted message bundle for IPFS
export interface EncryptedBundle {
  encryptedKey: string;
  encryptedMessage: string;
  iv: string;
  algorithm: string;
  version: string;
}

export async function createEncryptedBundle(
  message: string,
  recipientPublicKey: string
): Promise<EncryptedBundle> {
  const aesKey = await generateAESKey();
  const { ciphertext, iv } = await encryptAES(aesKey, message);
  const aesKeyRaw = await exportAESKey(aesKey);
  const publicKey = await importPublicKey(recipientPublicKey);
  const encryptedAESKey = await encryptWithPublicKey(publicKey, aesKeyRaw);

  return {
    encryptedKey: arrayBufferToBase64(encryptedAESKey),
    encryptedMessage: arrayBufferToBase64(ciphertext),
    iv: uint8ArrayToBase64(iv),
    algorithm: "AES-256-GCM + RSA-OAEP-SHA256",
    version: "1.0",
  };
}

export async function decryptBundle(
  bundle: EncryptedBundle,
  privateKeyBase64: string
): Promise<string> {
  const privateKey = await importPrivateKey(privateKeyBase64);
  const encryptedAESKey = base64ToArrayBuffer(bundle.encryptedKey);
  const aesKeyRaw = await decryptWithPrivateKey(privateKey, encryptedAESKey);
  const aesKey = await importAESKey(aesKeyRaw);
  const ciphertext = base64ToArrayBuffer(bundle.encryptedMessage);
  const iv = base64ToUint8Array(bundle.iv);

  return await decryptAES(aesKey, ciphertext, iv);
}
