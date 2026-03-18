import * as StellarSdk from "@stellar/stellar-sdk";

const rpcUrl = "https://soroban-testnet.stellar.org";
const server = new StellarSdk.rpc.Server(rpcUrl);

// Replace with your deployed contract ID
const CONTRACT_ID = "YOUR_CONTRACT_ID";

export async function addResult(studentId, subject, marks, keypair) {
  const account = await server.getAccount(keypair.publicKey());

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET
  })
    .addOperation(
      StellarSdk.Operation.invokeContractFunction({
        contract: CONTRACT_ID,
        function: "add_result",
        args: [
          StellarSdk.nativeToScVal(studentId, { type: "string" }),
          StellarSdk.nativeToScVal(subject, { type: "string" }),
          StellarSdk.nativeToScVal(marks, { type: "u32" })
        ]
      })
    )
    .setTimeout(30)
    .build();

  tx.sign(keypair);

  const prepared = await server.prepareTransaction(tx);
  const result = await server.sendTransaction(prepared);

  return result;
}

export async function getResult(studentId, subject) {
  const result = await server.simulateTransaction({
    contractId: CONTRACT_ID,
    function: "get_result",
    args: [studentId, subject]
  });

  return result;
}