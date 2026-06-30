#!/usr/bin/env node

/**
 * Contract Deployment Script
 * This script deploys the ExamResult contract to Stellar testnet
 * 
 * Usage: node deploy.js YOUR_PUBLIC_KEY
 * Example: node deploy.js GBBDDOX32RBMG64DC2EHQ7TGKO7W5RB4LZB2WPIMYCMDGS5TQJZ6FAMK
 */

import * as StellarSdk from "@stellar/stellar-sdk";
import * as fs from "fs";

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("❌ Error: Please provide your public key as an argument");
  console.error("Usage: node deploy.js YOUR_PUBLIC_KEY");
  console.error(
    "Example: node deploy.js GBBDDOX32RBMG64DC2EHQ7TGKO7W5RB4LZB2WPIMYCMDGS5TQJZ6FAMK"
  );
  process.exit(1);
}

const publicKey = args[0];
const RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;

// Validate public key
if (!StellarSdk.Keypair.isValidPublicKey(publicKey)) {
  console.error("❌ Error: Invalid public key format");
  process.exit(1);
}

// Read WASM file
const wasmPath = "./target/wasm32v1-none/release/hello_world.wasm";
if (!fs.existsSync(wasmPath)) {
  console.error("❌ Error: WASM file not found at", wasmPath);
  console.error("Please run: stellar contract build");
  process.exit(1);
}

const wasmBuffer = fs.readFileSync(wasmPath);
console.log(`✅ WASM file loaded: ${wasmPath} (${wasmBuffer.length} bytes)`);

// Initialize Stellar SDK
const server = new StellarSdk.rpc.Server(RPC_URL);

async function deployContract() {
  try {
    console.log("\n🚀 Deploying ExamResult Contract to Testnet...\n");

    // Get account info
    console.log("📋 Fetching account information...");
    const account = await server.getAccount(publicKey);
    console.log("✅ Account found. Sequence number:", account.sequenceNumber());

    // Create deployment transaction
    console.log("🔨 Building deployment transaction...");
    const builtTransaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        StellarSdk.Operation.createContractWithHostFunction({
          hostFunction: StellarSdk.xdr.HostFunction.hostFunctionTypeUploadContractWasm(
            wasmBuffer
          ),
          parameters: [
            StellarSdk.nativeToScVal("", { type: "string" }),
          ],
        })
      )
      .setTimeout(300)
      .build();

    console.log("✅ Transaction built. Hash:", builtTransaction.hash().toString("hex"));

    // Prepare transaction
    console.log("⏳ Preparing transaction (simulating)...");
    const preparedTransaction = await server.prepareTransaction(builtTransaction);
    console.log("✅ Transaction prepared");

    // Note about signing
    console.log("\n⚠️  IMPORTANT: This script requires manual transaction signing.");
    console.log("The transaction has been built but needs to be signed with your private key.");
    console.log("\nTwo options:");
    console.log(
      "1. Add your secret key to ~/.config/stellar/keys/YOUR_KEY_NAME (recommended for testing only)"
    );
    console.log("2. Use the Stellar Lab UI: https://lab.stellar.org/");
    console.log(
      "\nFor now, please use the Stellar Lab to submit this transaction manually."
    );

    console.log("\n💾 Saving transaction XDR to transaction.xdr for signing...");
    fs.writeFileSync("transaction.xdr", preparedTransaction.toXDR());
    console.log("✅ Saved to: transaction.xdr");

    console.log("\n📖 To complete deployment:");
    console.log("1. Go to: https://lab.stellar.org");
    console.log("2. Select Network: Testnet");
    console.log("3. Go to: Build Transaction → Transaction XDR");
    console.log("4. Paste the contents of transaction.xdr");
    console.log("5. Sign the transaction with your private key");
    console.log("6. Submit the transaction");
    console.log("\n7. The contract ID will be shown after successful submission");

  } catch (error) {
    console.error("❌ Error during deployment:", error.message);
    if (error.response) {
      console.error("Response:", error.response);
    }
    process.exit(1);
  }
}

// Run deployment
deployContract();
