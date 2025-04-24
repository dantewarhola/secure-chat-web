// client/src/crypto.ts
import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 } from 'tweetnacl-util';

/** Generate a 32-byte keypair for secretbox (symmetric) or box (asymmetric) */
export function generateKeyPair() {
  const kp = nacl.box.keyPair(); 
  return {
    publicKey: encodeBase64(kp.publicKey),
    privateKey: encodeBase64(kp.secretKey),
  };
}

/** Decode a base64 string back into a Uint8Array key */
export function b64ToKey(b64: string): Uint8Array {
  return decodeBase64(b64);
}

/** Encrypt a UTF-8 string with secretbox (XSalsa20-Poly1305) */
export function encryptMessage(
  message: string,
  key: Uint8Array
): { cipher: string; nonce: string } {
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const box = nacl.secretbox(decodeUTF8(message), nonce, key);
  return {
    cipher: encodeBase64(box),
    nonce: encodeBase64(nonce),
  };
}

/** Decrypt a secretbox ciphertext back to a UTF-8 string */
export function decryptMessage(
  cipherB64: string,
  nonceB64: string,
  key: Uint8Array
): string {
  const cipher = decodeBase64(cipherB64);
  const nonce = decodeBase64(nonceB64);
  const message = nacl.secretbox.open(cipher, nonce, key);
  if (!message) throw new Error('Decryption failed');
  return encodeUTF8(message);
}

export function deriveSharedKey(
  peerPublicB64: string,
  mySecretB64: string
): Uint8Array {
  // Convert both Base64 keys back into Uint8Arrays
  const peerPub = decodeBase64(peerPublicB64);
  const mySec   = decodeBase64(mySecretB64);

  // Derive the shared key
  return nacl.box.before(peerPub, mySec);
}
