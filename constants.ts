// constants.ts

// WARNING: THIS IS CONFIGURED FOR SOLANA MAINNET-BETA. REAL SOL WILL BE USED.
// For testing, consider changing SOLANA_NETWORK to "devnet" and using a devnet wallet and SOL.
export const SOLANA_NETWORK = "mainnet-beta"; // "mainnet-beta" or "devnet" or "testnet"
export const RECIPIENT_WALLET_ADDRESS = "5uk4cmutw31RWqcN5wXyut7XfpPWjV3Um7x5xHvBiT36";

export const CREDIT_PURCHASE_COST_SOL = 0.01;
export const CREDITS_PER_PURCHASE = 20;
export const IMAGE_GENERATION_CREDIT_COST = 1;

export const GEMINI_IMAGE_MODEL = 'imagen-3.0-generate-002';

// Solana RPC endpoint.
// ===================================================================================
// CRITICAL WARNING FOR 403 ERRORS ('failed to get recent blockhash'):
// Public RPC endpoints are heavily rate-limited and may block requests.
// Using a dedicated/private RPC endpoint is crucial for reliability.
// The endpoint below has been updated to the Helius RPC URL you provided.
// ===================================================================================
export const SOLANA_RPC_ENDPOINT = SOLANA_NETWORK === "mainnet-beta"
  ? 'https://mainnet.helius-rpc.com/?api-key=7fdd1d7d-06b4-4f1b-b01a-c1c4322ef620' // Updated to Helius RPC
  : 'https://api.devnet.solana.com';    // REPLACE THIS WITH YOUR PRIVATE RPC FOR DEVNET if you switch to devnet
