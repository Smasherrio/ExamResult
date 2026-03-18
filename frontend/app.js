import { addResult, getResult } from "./contract.js";
import * as StellarSdk from "@stellar/stellar-sdk";

// temporary test keypair
const keypair = StellarSdk.Keypair.random();

window.addResult = async function () {
  const studentId = document.getElementById("studentId").value;
  const subject = document.getElementById("subject").value;
  const marks = parseInt(document.getElementById("marks").value);

  const result = await addResult(studentId, subject, marks, keypair);

  document.getElementById("output").innerText =
    "Transaction submitted: " + JSON.stringify(result);
};

window.getResult = async function () {
  const studentId = document.getElementById("studentIdGet").value;
  const subject = document.getElementById("subjectGet").value;

  const result = await getResult(studentId, subject);

  document.getElementById("output").innerText =
    "Result: " + JSON.stringify(result);
};