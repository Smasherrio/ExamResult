# ExamResult Soroban Smart Contract

## Project Description

ExamResult is a decentralized smart contract built on the Stellar blockchain using the Soroban smart contract platform.  
The project provides a transparent and tamper-proof way to store and retrieve student examination results.

Traditional result storage systems rely on centralized databases, which may be vulnerable to manipulation, loss, or unauthorized modification. This smart contract demonstrates how academic results can be stored securely on a blockchain where records are immutable and verifiable.

## What it does

The smart contract allows authorized users to:

- Add a student's exam result
- Retrieve stored exam results
- Store results permanently on the blockchain

Each record contains:
- Student ID
- Subject
- Marks obtained

Once stored, the results can be retrieved by querying the contract with the student ID and subject.

## Features

- Decentralized result storage
- Immutable academic records
- Transparent verification of results
- Simple API functions for storing and retrieving results
- Built using Rust and Soroban SDK
- Runs on the Stellar blockchain network

## Smart Contract Functions

### add_result
Stores a student's exam result on the blockchain.

Parameters:
- `student_id` – Unique ID of the student
- `subject` – Subject name
- `marks` – Marks obtained in the exam

### get_result
Retrieves the stored exam result.

Parameters:
- `student_id` – Student identifier
- `subject` – Subject name

Returns:
- ResultRecord containing student ID, subject, and marks.

## Technologies Used

- Rust
- Soroban SDK
- Stellar Blockchain

## Deployed Smart Contract Link

 https://lab.stellar.org/r/testnet/contract/CDM3MJS6PXQGSZ2GM65O6PNELBIZSZMWWZOPPBVKS7RV7RIXJRM5JCOG

 ![transaction] (C:/Users/Spandan/Pictures/Screenshots/transaction.png)