import * as StellarSdk from "@stellar/stellar-sdk";
import { server, NETWORK_PASSPHRASE, getConnectedWallet, signTransaction } from "./utils/wallet.js";

// Load from environment variable for better security
const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID || "CBY7NLNN7N6AUDF7BFIAVLYPO3YY7OLLPZCR65JZZYT5X5SQZNMXC3F5";

// Input validation constants
const MAX_INPUT_LENGTH = 100;
const TIMEOUT_MS = 30000;

// Validate input strings
function validateInput(value, fieldName, maxLength = MAX_INPUT_LENGTH) {
  if (typeof value !== "string") {
    throw new Error(`${fieldName} must be a string`);
  }
  if (value.trim().length === 0) {
    throw new Error(`${fieldName} cannot be empty`);
  }
  if (value.length > maxLength) {
    throw new Error(`${fieldName} exceeds maximum length of ${maxLength} characters`);
  }
  return value.trim();
}

export async function addResult(studentId, subject, marks) {
  const wallet = getConnectedWallet();
  if (!wallet) {
    throw new Error("Please connect your wallet first");
  }

  // Validate all inputs
  studentId = validateInput(studentId, "Student ID");
  subject = validateInput(subject, "Subject");
  
  if (typeof marks !== "number" || marks < 0 || marks > 100 || !Number.isInteger(marks)) {
    throw new Error("Marks must be an integer between 0 and 100");
  }

  try {
    const account = await server.getAccount(wallet.publicKey);

    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        StellarSdk.Operation.invokeContractFunction({
          contract: CONTRACT_ID,
          function: "add_result",
          args: [
            StellarSdk.nativeToScVal(studentId, { type: "string" }),
            StellarSdk.nativeToScVal(subject, { type: "string" }),
            StellarSdk.nativeToScVal(marks, { type: "u32" }),
          ],
        })
      )
      .setTimeout(TIMEOUT_MS / 1000)
      .build();

    const signedTransaction = await signTransaction(transaction);
    const preparedTransaction = await server.prepareTransaction(signedTransaction);
    const result = await server.sendTransaction(preparedTransaction);

    return result;
  } catch (error) {
    // Don't expose internal error details
    console.error("Error adding result:", error);
    if (error.message.includes("network") || error.message.includes("connection")) {
      throw new Error("Network error. Please check your connection and try again.");
    }
    throw new Error("Failed to add result. Please try again.");
  }
}

export async function getResult(studentId, subject) {
  // Validate all inputs
  studentId = validateInput(studentId, "Student ID");
  subject = validateInput(subject, "Subject");

  try {
    // Use a temporary keypair for read-only operations (not storing sensitive data)
    const keypair = StellarSdk.Keypair.random();
    const account = await server.getAccount(keypair.publicKey());

    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        StellarSdk.Operation.invokeContractFunction({
          contract: CONTRACT_ID,
          function: "get_result",
          args: [
            StellarSdk.nativeToScVal(studentId, { type: "string" }),
            StellarSdk.nativeToScVal(subject, { type: "string" }),
          ],
        })
      )
      .setTimeout(TIMEOUT_MS / 1000)
      .build();

    const preparedTransaction = await server.prepareTransaction(transaction);
    const result = await server.simulateTransaction(preparedTransaction);

    if (result.status === "ok" && result.results && result.results.length > 0) {
      const parsedResult = StellarSdk.scValToNative(result.results[0].retValue);
      return {
        success: true,
        student_id: String(parsedResult.student_id),
        subject: String(parsedResult.subject),
        marks: Number(parsedResult.marks),
      };
    }

    return { success: false, error: null }; // Don't expose "not found" details
  } catch (error) {
    console.error("Error getting result:", error);
    if (error.message.includes("network") || error.message.includes("connection")) {
      throw new Error("Network error. Please check your connection and try again.");
    }
    throw new Error("Failed to retrieve result. Please try again.");
  }
}

// Only export URL-safe contract ID, never expose in client
export const getContractId = () => CONTRACT_ID;