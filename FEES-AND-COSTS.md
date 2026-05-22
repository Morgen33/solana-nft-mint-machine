# NFT Mint Machine — Fees & Costs Guide

**Who this is for:** You (the owner) using the tool on **mainnet** with real SOL.  
**Site:** https://solana-nft-mint-machine.vercel.app

This document explains **what you pay**, **what each fee is for**, and **where the money goes**. No platform fee from the website.

---

## The short answer

**You pay everything from your wallet.** The website does not charge a platform fee. Money goes to:

1. **Arweave** — store your image + metadata forever  
2. **Solana** — rent + network fees to create NFTs on-chain  
3. **Metaplex** — small protocol fees on some mint types  
4. **No one else** — not the app, not Pinata, not a monthly subscription to the mint site  

---

## Who gets paid (and who does not)

| Recipient | What they provide | Do you pay them? |
|-----------|-------------------|------------------|
| **Arweave (via Irys)** | Permanent storage for image + JSON | Yes — once per upload |
| **Solana validators** | Processing transactions, keeping the chain running | Yes — tiny amount per tx |
| **Solana “rent”** | On-chain account space for NFT data | Yes — per NFT (or per tree for compressed) |
| **Metaplex** | NFT standards / programs (Classic, Core, Compressed) | Yes — small protocol fee on some types |
| **NFT Mint Machine (your site)** | The web app | **No platform fee** |
| **Vercel** | Hosting the website | **You don’t pay** (site owner’s hosting) |

---

## Fee #1 — Arweave storage (image + metadata)

### What it’s for

Your picture and the metadata file (name, description, traits, image link) are stored so they **stay online forever** without you paying monthly pinning.

### When you pay

When you click **Launch**, or when you click **Save art + metadata to Arweave** before minting.

### Who gets the money

**Arweave** (upload is routed through **Irys**, which handles payment in SOL).

### Rough cost

| Item | About |
|------|--------|
| Small image + tiny JSON | ~$0.02–0.15 total |
| Bigger image (up to 10 MB cap) | ~$0.10–0.50+ |

Depends on file size and current rates.

### How often

**Once** for that upload. If you mint 20 copies with the **same** metadata link, you still only pay storage **once** for that image + JSON.

---

## Fee #2 — Compressed “storage tree” (Compressed NFTs only)

### What it’s for

Compressed NFTs don’t each get a full on-chain “parking spot” like classic NFTs. They share a **tree** (a big on-chain structure). You pay once to **create that tree**.

### When you pay

The first time you **Launch** compressed NFTs and you don’t already have a tree (one wallet approval: “create storage tree”).

### Who gets the money

**Solana rent** — SOL is locked in accounts on the chain. You’re paying for blockchain space, not a subscription to a company.

### Rough cost

**~$5–15** once (depends on tree size; this app uses a modest tree that holds up to **64** compressed NFTs).

### How often

**Once per tree** (saved in your browser for that wallet). Not per NFT.

**Not required** for Core or Classic NFT types.

---

## Fee #3 — Minting each NFT on Solana

### What it’s for

Actually **creating** each NFT in **your** wallet — the on-chain record that wallets and marketplaces recognize.

### When you pay

Each time you approve a **mint** during **Launch**. For compressed NFTs, that’s often **one wallet approval per NFT** (e.g. 20 approvals for 20 NFTs).

### Who gets the money

| Part | Where it goes |
|------|----------------|
| **Network fee** | **Solana validators** — like gas; very small per transaction |
| **Rent / account space** | **Solana** — SOL used for on-chain accounts (compressed uses less per NFT than Classic) |
| **Metaplex protocol fee** | **Metaplex** — on some standards (Classic is larger; compressed is very small) |

### Rough cost per NFT (mainnet)

Ballpark using typical SOL prices; **SOL price changes daily**.

| NFT type | Per NFT (about) |
|----------|-----------------|
| **Compressed** | ~$0.01–0.05 each (after tree exists) |
| **Core** | ~$0.30–0.50 each |
| **Classic** | ~$2+ each |

### Example: 20 compressed mints

After the tree exists, minting 20 might total **~$0.20–1.00**, not $40+.

---

## Fee #4 — Royalties (not a mint fee)

### What it’s for

If you set **5% royalty** in the form, that means when someone **resells** your NFT on a marketplace that honors royalties, **you** receive 5% of that sale.

### When you pay

**Never at mint time.**

### Who gets the money on a resale

**You** (the creator), from the buyer’s payment on the marketplace — minus that marketplace’s own fees.

---

## Example budget: 20 compressed NFTs, same image (Launch)

Typical owner workflow on mainnet.

| Step | What you’re paying for | Rough USD | Who receives it |
|------|------------------------|-----------|-----------------|
| Arweave upload | Image + auto-built metadata, stored forever | ~$0.05–0.15 | Arweave / Irys |
| Create tree (once) | On-chain space for the compressed NFT “garage” | ~$5–15 | Solana (rent) |
| Mint × 20 | 20 NFTs registered to your wallet | ~$0.20–1.00 | Solana + small Metaplex |
| **Total ballpark** | | **~$6–17** | |

**Recommended:** Keep **~0.5–1 SOL** in the wallet before Launch so you don’t run out mid-way if fees or SOL price move.

---

## What the money is NOT for

- A fee to NFT Mint Machine / the website  
- Pinata or IPFS (this app uses Arweave, not those)  
- Magic Eden or other marketplace listing fees (listing is a separate step later)  
- Monthly storage after Arweave upload (upload is intended as one-time permanent storage)  
- Royalties at launch (only on future resales, if any)  

---

## Money flow diagram (Launch 20 compressed)

```
Your wallet (SOL)
    │
    ├─► Arweave / Irys     →  permanent image + metadata JSON
    │
    ├─► Solana rent        →  compressed NFT tree (one-time)
    │
    └─► Solana + Metaplex (×20)  →  each NFT in your wallet
            ├─ validators     (network / “gas” fees)
            ├─ rent           (on-chain account space)
            └─ Metaplex       (protocol fee, small on compressed)
```

---

## Site owner vs person minting

| Role | Pays |
|------|------|
| **You using the tool to mint** | All Arweave + Solana + Metaplex costs in this doc |
| **You hosting the website** | Vercel (often free tier), optional custom domain ~$10–15/year — **not** charged to people who visit the site |

The mint machine does **not** take a cut of user mints.

---

## Devnet vs mainnet

| | **Devnet (practice)** | **Mainnet (real)** |
|--|------------------------|---------------------|
| Mint / tree | Free fake SOL from faucet | **Real SOL** |
| Arweave upload | May still cost **real** SOL | **Real SOL** |
| NFT value | None | Real |

For a real launch, use **Mainnet** and treat every wallet approval as **real money**.

---

## One sentence per fee type

| Fee | In plain English |
|-----|------------------|
| **Arweave** | “Host my image and metadata forever.” |
| **Tree** | “Buy the filing cabinet for compressed NFTs.” |
| **Mint** | “Register each NFT on Solana in my wallet.” |
| **Network fee** | “Pay the chain to process the transaction.” |
| **Rent** | “Pay for data living on Solana’s ledger.” |
| **Metaplex** | “Use the standard NFT programs wallets and markets recognize.” |
| **Royalty %** | “If it resells later, I get a cut” — **not** paid upfront. |

---

## Compare NFT types (mainnet, rough)

| Type | Best for | Upfront extra | Per NFT |
|------|----------|---------------|---------|
| **Compressed** | 20+ copies, same image | Tree ~$5–15 once | ~1¢ each |
| **Core** | 1–20 “normal” NFTs | None | ~$0.30–0.50 |
| **Classic** | Max compatibility | None | ~$2+ |

---

## Related docs

- **Step-by-step usage:** [OWNER-MANUAL.md](./OWNER-MANUAL.md)  
- **Technical setup / deploy:** [README.md](./README.md)  

---

## Disclaimer

Costs are **estimates**. SOL price, file size, and network congestion change what you actually pay. Always confirm amounts in your wallet before approving. This is not financial or tax advice.

*Last updated for the Launch flow (auto metadata + Arweave + one-click mint).*
