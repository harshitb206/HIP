export class CryptoService {
  private static algorithm = {
    name: "ECDSA",
    namedCurve: "P-256",
  };

  // Generate a new ECDSA KeyPair
  static async generateKeyPair(): Promise<CryptoKeyPair> {
    return await window.crypto.subtle.generateKey(
      this.algorithm,
      true, // extractable
      ["sign", "verify"]
    );
  }

  // Export public key to JWK format for embedding in token
  static async exportPublicKey(key: CryptoKey): Promise<JsonWebKey> {
    return await window.crypto.subtle.exportKey("jwk", key);
  }

  // Sign a string payload
  static async sign(privateKey: CryptoKey, data: string): Promise<string> {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);
    const signatureBuffer = await window.crypto.subtle.sign(
      {
        name: "ECDSA",
        hash: { name: "SHA-256" },
      },
      privateKey,
      encodedData
    );
    return this.arrayBufferToHex(signatureBuffer);
  }

  // Verify a signature
  static async verify(publicKeyJwk: JsonWebKey, signatureHex: string, data: string): Promise<boolean> {
    try {
      const publicKey = await window.crypto.subtle.importKey(
        "jwk",
        publicKeyJwk,
        this.algorithm,
        true,
        ["verify"]
      );

      const encoder = new TextEncoder();
      const encodedData = encoder.encode(data);
      const signatureBuffer = this.hexToArrayBuffer(signatureHex);

      return await window.crypto.subtle.verify(
        {
          name: "ECDSA",
          hash: { name: "SHA-256" },
        },
        publicKey,
        signatureBuffer,
        encodedData
      );
    } catch (e) {
      console.error("Verification error:", e);
      return false;
    }
  }

  // Create a SHA-256 hash (simulating irreversible identity hash)
  static async hashString(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", encodedData);
    return this.arrayBufferToHex(hashBuffer);
  }

  // Helper: Buffer to Hex
  private static arrayBufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Helper: Hex to Buffer
  private static hexToArrayBuffer(hexString: string): ArrayBuffer {
    const bytes = new Uint8Array(Math.ceil(hexString.length / 2));
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hexString.substr(i * 2, 2), 16);
    }
    return bytes.buffer;
  }
}
