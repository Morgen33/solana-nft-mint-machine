# Solana NFT Mint Machine

A wallet-connected web app to mint Metaplex NFTs on Solana (devnet by default). Connect Phantom or Solflare, build metadata, simulate, then mint one or up to 20 NFTs in a batch.

## Quick start

```bash
cd solana-nft-mint-machine
npm install
npm run dev
```

Open http://localhost:5173

## Mint flow

1. **Connect wallet** (switch network in wallet to match Devnet/Mainnet tab).
2. Fill in name, image URL, description, optional traits.
3. Click **Download metadata JSON** and upload the file to [NFT.Storage](https://nft.storage), [Pinata](https://pinata.cloud), or Arweave.
4. Paste the hosted **metadata URI** into the form.
5. Click **Mint** — the app simulates the transaction first, then asks your wallet to sign.

## Devnet SOL

```bash
solana airdrop 2 YOUR_WALLET_ADDRESS --url devnet
```

## Environment

Copy `.env.example` to `.env` and set a dedicated RPC URL for better reliability:

```
VITE_SOLANA_RPC_URL=https://your-devnet-rpc
```

## Stack

- React + Vite + TypeScript
- `@solana/wallet-adapter-*` (Phantom, Solflare)
- Metaplex `mpl-token-metadata` via Umi

## Security

- Defaults to **devnet**. Mainnet requires an explicit tab switch and shows a warning.
- Each mint is **simulated** before the wallet signature prompt.
- Never paste private keys into this app.

## Deploy (Vercel)

```bash
npm run build
vercel --prod
```

Set environment variables in the Vercel dashboard for reliable RPC:

- `VITE_SOLANA_RPC_URL` — devnet RPC
- `VITE_SOLANA_MAINNET_RPC_URL` — mainnet RPC (optional)

Custom domain: Vercel project → Settings → Domains.
