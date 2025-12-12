export enum HipPurpose {
  CONCERT = 'concert',
  EXAM = 'exam',
  AIRPORT = 'airport-demo',
  VOTING = 'voting-sim',
  METAVERSE = 'metaverse',
  UNIVERSAL_ACCESS = 'universal_access'
}

export enum EventCategory {
  CONCERT = 'CONCERT',
  CONFERENCE = 'CONFERENCE',
  RESTRICTED = 'RESTRICTED_AREA',
  TRANSPORT = 'PUBLIC_TRANSPORT',
  SOCIAL = 'SOCIAL_GATHERING'
}

export interface HipEvent {
  id: string;
  name: string;
  category: EventCategory;
  createdAt: number;
  status: 'OPEN' | 'CLOSED';
}

export interface HipTokenPayload {
  hipId: string;
  maskedHash: string; // The public-facing ID
  purpose: HipPurpose;
  issuedAt: number;
  exp: number;
  issuer: string;
  nonce: string;
  scope: string[];
  meta: {
    displayName: string;
    avatarPreview: string; // Data URI for the photo
    ip?: string;
    location?: string;
    audioData?: string; // Base64 audio string for voice auth
  };
}

export interface SignedHipToken {
  payload: HipTokenPayload;
  signature: string; // Hex string of the signature
  publicKey: JsonWebKey; // Public key to verify against (simulated PKI)
}

export interface LedgerEntry {
  hipId: string;
  identityHash: string; // Internal irreversible hash
  maskedHash: string; // Public hash
  issuer: string;
  issuedAt: number;
  exp: number;
  revoked: boolean;
  biometricVector?: number[]; // Simulation of stored vector (mock)
  ip?: string;
  location?: string;
  audioData?: string; // Voice sample
  avatarImage?: string; // High-res avatar for admin view
}

export interface VerificationResult {
  isValid: boolean;
  score: number;
  checks: {
    signature: boolean;
    ledger: boolean;
    expiry: boolean;
    biometricMatch: boolean;
  };
  message: string;
  meta?: {
    location?: string;
    ip?: string;
  }
}