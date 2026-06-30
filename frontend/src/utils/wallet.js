import * as StellarSdk from "@stellar/stellar-sdk";
import * as FreighterApi from "@stellar/freighter-api";

const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;

// RPC URLs with fallback
const RPC_URLS = [
  import.meta.env.VITE_RPC_URL || "https://soroban-testnet.stellar.org",
  "https://soroban-testnet.stellar.org", // Fallback
];

let currentRpcIndex = 0;
let RPC_URL = RPC_URLS[currentRpcIndex];

let server = new StellarSdk.rpc.Server(RPC_URL);
let connectedWallet = null;

// Rate limiting for transactions
let lastTransactionTime = 0;
const MIN_TRANSACTION_INTERVAL = 1000; // 1 second minimum between transactions

// Function to switch to next RPC URL on failure
function switchRpcUrl() {
  currentRpcIndex = (currentRpcIndex + 1) % RPC_URLS.length;
  if (currentRpcIndex === 0) {
    throw new Error("All RPC endpoints are unavailable");
  }
  RPC_URL = RPC_URLS[currentRpcIndex];
  server = new StellarSdk.rpc.Server(RPC_URL);
}

export async function isFreighterInstalled() {
  if (typeof window === "undefined") return false;
  return await window.freighter?.isConnected() ?? false;
}

export async function connectWallet() {
  try {
    if (typeof window === "undefined" || !window.freighter) {
      throw new Error("Freighter wallet is not installed. Please install the Freighter extension.");
    }

    const isConnected = await window.freighter.isConnected();
    if (!isConnected) {
      await window.freighter.requestAccess();
    }

    const { publicKey } = await window.freighter.getUserInfo();
    
    // Validate public key format
    if (!StellarSdk.Keypair.isValidPublicKey(publicKey)) {
      throw new Error("Invalid public key received from wallet");
    }

    const networkDetails = await window.freighter.getNetworkDetails();

    if (networkDetails.networkPassphrase !== NETWORK_PASSPHRASE) {
      throw new Error(`Wrong network. Please connect to Stellar Testnet in Freighter.`);
    }

    connectedWallet = {
      publicKey,
      network: networkDetails.network,
      networkPassphrase: networkDetails.networkPassphrase,
    };

    return connectedWallet;
  } catch (error) {
    console.error("Wallet connection error:", error);
    // Don't expose internal error details to user
    throw new Error("Failed to connect wallet. Please try again.");
  }
}

export function getConnectedWallet() {
  return connectedWallet;
}

export function isWalletConnected() {
  return connectedWallet !== null;
}

export function disconnectWallet() {
  connectedWallet = null;
}

export async function signTransaction(transaction) {
  if (!connectedWallet) {
    throw new Error("Wallet not connected");
  }

  // Rate limiting
  const now = Date.now();
  if (now - lastTransactionTime < MIN_TRANSACTION_INTERVAL) {
    throw new Error("Please wait before submitting another transaction");
  }
  lastTransactionTime = now;

  try {
    const signedTx = await window.freighter.signTransaction(
      transaction.toXDR(),
      {
        networkPassphrase: NETWORK_PASSPHRASE,
      }
    );

    return StellarSdk.TransactionBuilder.fromXDR(
      signedTx,
      NETWORK_PASSPHRASE
    );
  } catch (error) {
    console.error("Transaction signing error:", error);
    throw new Error("Transaction was rejected by wallet");
  }
}

export function getPublicKey() {
  return connectedWallet?.publicKey ?? null;
}

export { server, NETWORK_PASSPHRASE, RPC_URL };