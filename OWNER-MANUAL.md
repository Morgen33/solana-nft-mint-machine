# NFT Mint Machine — Owner Manual

**Site:** https://solana-nft-mint-machine.vercel.app  
**Who this is for:** You (the owner) minting your own NFTs on Solana mainnet.

---

## Before you start

### What you need

- A **Phantom** or **Solflare** wallet
- **SOL on mainnet** (real money). Safe starting amount: **~1 SOL**
  - Covers Arweave upload, compressed “tree” setup, and 20 mints with buffer
- Your **NFT image file** (PNG, JPG, GIF, or WebP — under 10 MB)
- A computer or phone with the wallet extension/app installed

### Wallet settings (important)

1. Open Phantom or Solflare.
2. Switch network to **Mainnet** (not Devnet).
3. Confirm you see real SOL balance (not “devnet” or “test” SOL).

### What this tool does *not* do

- It does not sell NFTs to the public by itself (no built-in payment page).
- It does not list on Magic Eden automatically.
- It does not create a website or Discord for your project.

It **creates** NFTs in **your** wallet. You can hold, transfer, or list them elsewhere later.

---

## The screen at a glance

| Area | What it means |
|------|----------------|
| **Mainnet / Devnet** tabs at top | Use **Mainnet** for real NFTs. Devnet is only for practice. |
| **Connect wallet** | Links your Phantom/Solflare to the site. |
| **Three NFT type cards** | Pick how each NFT is stored on Solana (see below). |
| **Green Arweave box** | Uploads your image + info permanently. |
| **Mint button** | Creates the NFT(s) on-chain. |

---

## Choose your NFT type

### Compressed (best for 20 copies, same image)

- **Use when:** You want many NFTs (e.g. 20) with the **same picture**.
- **Cost pattern:** Pay once to create a “storage tree” (~$5–15), then ~1¢ per NFT.
- **Badge on site:** “Best for your 20”

### Core

- **Use when:** A few NFTs (1–20), each needs to be a “normal” modern NFT.
- **Cost:** ~$0.30–0.50 each (much cheaper than Classic).

### Classic

- **Use when:** You need maximum compatibility with older tools/markets.
- **Cost:** ~$2+ each (most expensive).

**Your usual workflow:** **Compressed** + **20** quantity + **one image**.

---

## Full walkthrough: 20 compressed NFTs (same image)

This is the path you built the site for.

### Step 1 — Open the site and connect

1. Go to https://solana-nft-mint-machine.vercel.app
2. Confirm **Mainnet** is selected (top center).
3. Click **Connect wallet** → choose Phantom or Solflare → approve.

### Step 2 — Select Compressed

1. Click the **Compressed** card (📦).
2. It should highlight in cyan.

### Step 3 — Create your storage tree (one-time)

1. In the amber **Step 1** box, click **Create storage tree (one-time)**.
2. Your wallet pops up → **Approve**.
3. Wait until the box turns **green** (“Step 1 done — storage ready”).
4. You only do this **once per wallet** (saved in your browser). If you switch browsers or clear data, you may need to create again — or use **Reset tree** only if you intentionally want a new tree.

**What you paid for:** A private on-chain “filing cabinet” that holds up to **64** compressed NFTs. Only your wallet can mint into it.

### Step 4 — Fill in details

| Field | What to enter | Example |
|-------|----------------|---------|
| **Name** | Collection or piece name | `My Art Drop` |
| **Symbol** | Short ticker (optional) | `ART` |
| **Royalty %** | Your cut on future resales | `5` (means 5%) |
| **Description** | Plain text about the NFT | `Limited run of 20.` |
| **Attributes** | Optional JSON traits | Leave blank or use the example format |

Minted names will be: `My Art Drop #1`, `My Art Drop #2`, … `My Art Drop #20`.

### Step 5 — Upload to Arweave (permanent storage)

1. In the **green** box, click the upload area and **choose your image file**.
2. Check the **estimated storage cost** (small SOL amount).
3. Click **Upload to Arweave (permanent)**.
4. Approve any wallet prompts (storage payment).
5. When done, you’ll see:
   - Success message
   - **Image** and **Metadata** links filled in below

**Important:** One upload = one metadata link. Use that **same metadata link** for all 20 mints.

You do **not** need to upload 20 separate images.

### Step 6 — Set quantity

1. Set **How many to mint?** to **20**.

### Step 7 — Mint

1. Click **Mint 20 Compressed NFTs**.
2. The site **simulates** first (safety check), then asks your wallet to sign.
3. For compressed NFTs, you typically get **one wallet approval per NFT** (up to 20). Confirm each one, or cancel if you want to stop partway.
4. When finished, the **Minted** section lists each piece with **View tx** links to Solana Explorer.

### Step 8 — See your NFTs

1. Open **Phantom** → **Collectibles** (or Solflare equivalent).
2. Compressed NFTs may take a minute to appear.
3. You should see 20 items with numbered names.

---

## Shorter paths

### Mint 1 NFT (any type, with Arweave upload)

1. Mainnet + connect wallet.
2. Pick **Core** or **Classic** (skip tree setup).
3. Fill name / description.
4. **Upload to Arweave**.
5. Quantity **1** → **Mint**.

### You already uploaded to Arweave elsewhere

1. Expand **“Already have Arweave links? Paste them manually”**.
2. Paste **Image URL** and **Metadata URI**.
3. Mint as usual (no green upload box needed).

### Practice on Devnet (fake SOL)

1. Switch tab to **Devnet**.
2. Get free devnet SOL: `solana airdrop 2 YOUR_WALLET_ADDRESS --url devnet`
3. Same steps — NFTs are **not real** and have no value.

---

## What each cost is (mainnet, rough)

| Action | Paid from | About |
|--------|-----------|--------|
| Arweave upload (image + JSON) | Your wallet | Few cents – ~$0.10 (depends on file size) |
| Compressed tree setup | Your wallet | ~$5–15 once |
| Each compressed mint | Your wallet | ~1¢ each |
| Each Core mint | Your wallet | ~$0.30–0.50 each |
| Each Classic mint | Your wallet | ~$2+ each |

**Royalties** (e.g. 5%) are **not** charged at mint time. They apply when someone **resells** your NFT on a marketplace that honors them.

---

## Troubleshooting

| Problem | What to try |
|---------|-------------|
| “Connect wallet first” | Click Connect; unlock Phantom/Solflare. |
| Wallet on wrong network | Switch wallet app to **Mainnet**, refresh page. |
| “Create storage tree first” | Complete Step 1 (amber box) before minting compressed. |
| “Simulation failed” / mint error | Need more SOL; or retry in a few minutes (RPC busy). |
| Upload to Arweave failed | Smaller image; confirm mainnet + SOL; try again. |
| Cancelled in wallet | You rejected a prompt — click mint/upload again. |
| NFTs not in wallet yet | Wait 1–5 min; refresh Phantom; check Explorer tx succeeded. |
| Wrong number minted | You stopped approving mid-batch — check **Minted** list for how many completed. |
| Tree / links lost | New browser or cleared storage — may need new tree or re-upload. |

---

## After minting (owner checklist)

- [ ] All transactions show **success** on Solana Explorer (links on site).
- [ ] NFTs visible in wallet collectibles.
- [ ] Save your **metadata URI** and **image URI** somewhere safe (spreadsheet or notes).
- [ ] Optional: list on Magic Eden, Tensor, etc. (separate process).
- [ ] Optional: share mint page only if you want **others** to mint — this tool mints to **your** wallet by default.

---

## Quick reference card

```
MAINNET → Connect → Compressed → Create tree (once)
→ Name + description → Upload image to Arweave
→ Quantity 20 → Mint 20 → Approve wallet ~20 times
→ Check Phantom collectibles
```

---

## Support links

- **Live app:** https://solana-nft-mint-machine.vercel.app
- **Code / updates:** https://github.com/Morgen33/solana-nft-mint-machine
- **Solana Explorer:** https://explorer.solana.com (paste tx signature from site)

---

*Not financial advice. Mainnet uses real SOL. Double-check wallet network and transaction details before approving.*
