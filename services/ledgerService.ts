import { LedgerEntry, HipEvent, EventCategory } from '../types';
import { CryptoService } from './cryptoService';

const STORAGE_KEY = 'hip_ledger_v1';
const EVENTS_KEY = 'hip_events_v1';

class LedgerService {
  private ledger: LedgerEntry[] = [];
  private events: HipEvent[] = [];
  
  constructor() {
    this.loadFromStorage();
    if (this.ledger.length === 0) {
        this.seedDemoData();
    }
  }

  private loadFromStorage() {
    try {
        const storedLedger = localStorage.getItem(STORAGE_KEY);
        if (storedLedger) {
            this.ledger = JSON.parse(storedLedger);
        }
        const storedEvents = localStorage.getItem(EVENTS_KEY);
        if (storedEvents) {
            this.events = JSON.parse(storedEvents);
        }
    } catch (e) {
        console.error("Failed to load data", e);
    }
  }

  private saveToStorage() {
    try {
        // Sanitize ledger to remove large base64 strings before saving
        // LocalStorage has a 5MB limit. Audio and High-Res Images will crash it.
        const safeLedger = this.ledger.map(entry => {
            // Create a copy so we don't mutate in-memory state
            const safeEntry = { ...entry };
            
            // Remove audio data (too large for localStorage)
            delete safeEntry.audioData;
            
            // Optionally check image size, though CaptureFlow optimization should handle it.
            // If we have extremely large strings, we drop them to save the rest of the data.
            if (safeEntry.avatarImage && safeEntry.avatarImage.length > 500000) {
               delete safeEntry.avatarImage;
            }
            
            return safeEntry;
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(safeLedger));
        localStorage.setItem(EVENTS_KEY, JSON.stringify(this.events));
    } catch (e) {
        console.error("Storage Quota Exceeded. Failed to save ledger to disk.", e);
        // Attempt emergency save (metadata only)
        try {
            const skeletonLedger = this.ledger.map(entry => {
                const { audioData, avatarImage, ...rest } = entry;
                return rest;
            });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(skeletonLedger));
        } catch (innerE) {
            console.error("Critical storage failure", innerE);
        }
    }
  }

  private async seedDemoData() {
    const dummyId = "demo-user-888";
    const now = Date.now();
    this.ledger.push({
      hipId: dummyId,
      identityHash: await CryptoService.hashString("demo-biometrics"),
      maskedHash: await CryptoService.hashString("demo-masked"),
      issuer: "HIP-Demo-Genesis",
      issuedAt: now - 100000,
      exp: now + 86400000,
      revoked: false,
      location: "New York, US",
      ip: "192.168.1.101"
    });
    
    // Seed Events
    if (this.events.length === 0) {
        this.events.push({
            id: 'evt-001',
            name: 'CYBER_SUMMIT_2030',
            category: EventCategory.CONFERENCE,
            createdAt: now,
            status: 'OPEN'
        });
    }
    this.saveToStorage();
  }

  // --- LEDGER METHODS ---

  public registerHip(entry: LedgerEntry) {
    console.log(`[LEDGER] New Block Mined: HIP ${entry.hipId}`);
    this.ledger.push(entry);
    this.saveToStorage();
  }

  public getEntry(hipId: string): LedgerEntry | undefined {
    // We try to find in memory first (which has full data for session)
    return this.ledger.find(e => e.hipId === hipId);
  }

  public revokeHip(hipId: string) {
    const entry = this.ledger.find(e => e.hipId === hipId);
    if (entry) {
      entry.revoked = true;
      console.log(`[LEDGER] Revocation Transaction Confirmed: HIP ${hipId}`);
      this.saveToStorage();
    }
  }

  public getAllEntries(): LedgerEntry[] {
    return [...this.ledger];
  }
  
  public getStats() {
      const total = this.ledger.length;
      const revoked = this.ledger.filter(l => l.revoked).length;
      const active = total - revoked;
      return { total, active, revoked };
  }

  // --- EVENT METHODS ---

  public createEvent(name: string, category: EventCategory) {
      const newEvent: HipEvent = {
          id: `evt-${Math.random().toString(36).substr(2, 6)}`,
          name: name.toUpperCase().replace(/\s+/g, '_'),
          category,
          createdAt: Date.now(),
          status: 'OPEN'
      };
      this.events.push(newEvent);
      this.saveToStorage();
      return newEvent;
  }

  public getEvents(): HipEvent[] {
      return [...this.events];
  }

  public deleteEvent(id: string) {
      this.events = this.events.filter(e => e.id !== id);
      this.saveToStorage();
  }
}

export const ledgerService = new LedgerService();