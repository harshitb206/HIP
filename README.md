<img width="1825" height="828" alt="image" src="https://github.com/user-attachments/assets/2dd6ef2d-8a8d-490a-b1ea-79c02e1e019f" />
<img width="963" height="650" alt="image" src="https://github.com/user-attachments/assets/8cb69a55-76d5-4074-aef6-646e43a87577" />
<img width="957" height="650" alt="image" src="https://github.com/user-attachments/assets/f832bbf4-5287-4ff5-be3a-b2f90bc443de" />
<img width="957" height="650" alt="image" src="https://github.com/user-attachments/assets/b248b58f-c72c-4eff-bf19-013111468c25" />
<img width="924" height="648" alt="image" src="https://github.com/user-attachments/assets/4b7e4ebb-12f8-43d1-a988-87c9aa26435e" />
<img width="1569" height="716" alt="image" src="https://github.com/user-attachments/assets/da1ade93-19e0-49ea-b94f-70d9dfc95d66" />
<img width="1620" height="798" alt="image" src="https://github.com/user-attachments/assets/849623e2-89e4-4374-b1b8-534b968caa79" />
"Authorization Of Admin"
<img width="1918" height="813" alt="image" src="https://github.com/user-attachments/assets/67cb5890-2589-4d55-b957-16a3bdf28ce6" />
# Holographic Identity Passport (H.I.P.) Protocol

A privacy-first, "2030-ready" digital identity prototype designed for secure, self-sovereign verification in the open metaverse. H.I.P. combines high-assurance biometric simulation with blockchain-inspired immutable ledgers and zero-knowledge cryptographic signatures.

---

## 🚀 Overview

The H.I.P. protocol solves the problem of 1:1 personhood in digital environments without compromising user privacy. By utilizing client-side key generation and biometric hashing, the system ensures that sensitive data never leaves the user's execution environment while remaining fully verifiable by authorized "NETSEC" nodes.

### Key Features

* **Self-Sovereign Identity**: ECDSA (P-256) key pairs are generated locally via the WebCrypto API.
* **Biometric Ingestion**: Simulated face-tracking and voice-print calibration to create a "Digital Twin" hash.
* **Immutable Ledger**: A real-time audit log that tracks active, expired, and revoked identities.
* **Zero-Knowledge Verification**: Verifiers can confirm identity validity without accessing the user's underlying private data.
* **HUD-Inspired Interface**: A futuristic, high-fidelity UI featuring holographic avatars, CRT overlays, and custom cursor interactions.

---

## 🛠 Architecture

The system is divided into three primary functional nodes:

1. **Citizen Enclave (Client)**: The user-facing application for minting identity tokens and managing passport data.
2. **Consensus Layer (Ledger)**: The source of truth for all issued and revoked H.I.P. IDs.
3. **Admin Node (NETSEC)**: A restricted dashboard for security personnel to audit the ledger and manage event access "Gates".

---

## 💻 Tech Stack

* **Framework**: React 19
* **Styling**: Tailwind CSS with custom HUD components
* **Icons**: Lucide React
* **Cryptography**: WebCrypto API (ECDSA P-256 / SHA-256)
* **Routing**: React Router 7
* **Build Tool**: Vite

---

## ⚙️ Verification Logic

The core verification sequence follows a three-step protocol:

1. **Signature Check**: Validates the cryptographic signature against the user's public key.
2. **Ledger Audit**: Confirms the ID is registered and hasn't been revoked.
3. **Integrity Match**: Ensures the biometric hash in the payload matches the immutable record in the ledger.

---

## 🚦 Getting Started

### Prerequisites

* Node.js (LTS recommended)

### Installation

1. **Clone the repository** and navigate to the project folder.
2. **Install dependencies**:
```bash
npm install

```


3. **Configure Environment**: Set your `GEMINI_API_KEY` in `.env.local`.
4. **Launch the App**:
```bash
npm run dev

```



The application will be available at `http://localhost:3000`.

---

## 🛡 Security & Privacy

* **Private Keys**: Never transmitted or stored outside the browser.
* **Data Masking**: Users can enable a "Privacy Shield" to mask their identity during visual inspections.
* **Revocation**: Admin nodes can "Purge" identities, immediately invalidating all associated tokens across the network.

*Note: This is a prototype for demonstration purposes. Biometric data and ledger entries are currently simulated using browser local storage.*
# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1utFe313hQhrmUG00MxXHy6APN325M8kk

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
