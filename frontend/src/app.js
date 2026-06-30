import { connectWallet, disconnectWallet, getConnectedWallet, isWalletConnected, getPublicKey } from "./utils/wallet.js";
import { addResult, getResult, getContractId } from "./contract.js";

// DOM Elements
const connectWalletBtn = document.getElementById("connect-wallet");
const disconnectWalletBtn = document.getElementById("disconnect-wallet");
const walletInfo = document.getElementById("wallet-info");
const walletAddressEl = document.getElementById("wallet-address");

// Add Result Form Elements
const addResultForm = document.getElementById("add-result-form");
const addResultStatus = document.getElementById("add-result-status");

// Get Result Form Elements
const getResultForm = document.getElementById("get-result-form");
const resultDisplay = document.getElementById("result-display");
const resultDataEl = document.getElementById("result-data");
const getResultStatus = document.getElementById("get-result-status");

// Initialize the app
async function init() {
  // Check if already connected
  if (isWalletConnected()) {
    updateWalletUI();
  }

  // Event listeners
  connectWalletBtn.addEventListener("click", handleConnectWallet);
  disconnectWalletBtn.addEventListener("click", handleDisconnectWallet);
  addResultForm.addEventListener("submit", handleAddResult);
  getResultForm.addEventListener("submit", handleGetResult);
}

// Wallet Connection Handlers
async function handleConnectWallet() {
  try {
    connectWalletBtn.disabled = true;
    connectWalletBtn.textContent = "Connecting...";
    
    await connectWallet();
    updateWalletUI();
    showStatus(addResultStatus, "Wallet connected successfully!", "success");
    showStatus(getResultStatus, "Wallet connected successfully!", "success");
  } catch (error) {
    console.error("Wallet connection failed:", error);
    showStatus(addResultStatus, `Connection failed: ${error.message}`, "error");
    showStatus(getResultStatus, `Connection failed: ${error.message}`, "error");
  } finally {
    connectWalletBtn.disabled = false;
    connectWalletBtn.textContent = "Connect Wallet";
  }
}

function handleDisconnectWallet() {
  disconnectWallet();
  updateWalletUI();
  showStatus(addResultStatus, "Wallet disconnected", "info");
  showStatus(getResultStatus, "Wallet disconnected", "info");
}

function updateWalletUI() {
  const wallet = getConnectedWallet();
  if (wallet) {
    walletInfo.classList.remove("hidden");
    connectWalletBtn.classList.add("hidden");
    disconnectWalletBtn.classList.remove("hidden");
    walletAddressEl.textContent = `${wallet.publicKey.slice(0, 6)}...${wallet.publicKey.slice(-4)}`;
  } else {
    walletInfo.classList.add("hidden");
    connectWalletBtn.classList.remove("hidden");
    disconnectWalletBtn.classList.add("hidden");
    walletAddressEl.textContent = "";
  }
}

// Form Submission Handlers
async function handleAddResult(e) {
  e.preventDefault();
  
  if (!isWalletConnected()) {
    showStatus(addResultStatus, "Please connect your wallet first", "error");
    return;
  }

  const studentId = document.getElementById("student-id").value.trim();
  const subject = document.getElementById("subject").value.trim();
  const marks = parseInt(document.getElementById("marks").value);

  if (!studentId || !subject || isNaN(marks) || marks < 0 || marks > 100) {
    showStatus(addResultStatus, "Please fill in all fields correctly", "error");
    return;
  }

  try {
    const submitBtn = addResultForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";
    showStatus(addResultStatus, "Submitting transaction...", "info");

    const result = await addResult(studentId, subject, marks);
    
    showStatus(addResultStatus, "Result added successfully! Transaction hash: " + result.hash.substring(0, 10) + "...", "success");
    addResultForm.reset();
    
  } catch (error) {
    console.error("Add result failed:", error);
    showStatus(addResultStatus, `Failed: ${error.message}`, "error");
  } finally {
    const submitBtn = addResultForm.querySelector('button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Result";
  }
}

async function handleGetResult(e) {
  e.preventDefault();
  
  if (!isWalletConnected()) {
    showStatus(getResultStatus, "Please connect your wallet first", "error");
    return;
  }

  const studentId = document.getElementById("student-id-get").value.trim();
  const subject = document.getElementById("subject-get").value.trim();

  if (!studentId || !subject) {
    showStatus(getResultStatus, "Please fill in both fields", "error");
    return;
  }

  try {
    const submitBtn = getResultForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Fetching...";
    showStatus(getResultStatus, "Retrieving result...", "info");

    const result = await getResult(studentId, subject);
    
    if (result.success) {
      resultDataEl.innerHTML = `
        <div class="result-item"><span class="result-label">Student ID:</span><span class="result-value">${result.student_id}</span></div>
        <div class="result-item"><span class="result-label">Subject:</span><span class="result-value">${result.subject}</span></div>
        <div class="result-item"><span class="result-label">Marks:</span><span class="result-value">${result.marks}</span></div>
      `;
      resultDisplay.classList.remove("hidden");
      showStatus(getResultStatus, "Result retrieved successfully!", "success");
    } else {
      resultDisplay.classList.add("hidden");
      showStatus(getResultStatus, "No result found for this student and subject", "info");
    }
    
  } catch (error) {
    console.error("Get result failed:", error);
    resultDisplay.classList.add("hidden");
    showStatus(getResultStatus, `Failed: ${error.message}`, "error");
  } finally {
    const submitBtn = getResultForm.querySelector('button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.textContent = "Get Result";
  }
}

// Helper Functions
function showStatus(element, message, type = "info") {
  element.textContent = message;
  element.className = `status-message ${type}`;
  element.classList.remove("hidden");
  
  // Auto-hide success/error messages after 5 seconds
  if (type === "success" || type === "error") {
    setTimeout(() => {
      element.classList.add("hidden");
    }, 5000);
  }
}

// Start the app when DOM is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}