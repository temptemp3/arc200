//const CONTRACT = require("../lib/contract.js");
import CONTRACT from "../lib/contract.js";
import dotenv from "dotenv";
import algosdk from "algosdk";
import ARC200Spec from "../abi/ARC200.json" assert { type: "json" }; // standard methods
import ARC200Nonstandard from "../abi/ARC200Nonstandard.json" assert { type: "json" }; // add non-standard methods such as hasBalance and hasAllowance
dotenv.config();
const algodToken = ""; // Your Algod API token
const algodServer = process.env.ALGOD_URL; // Address of your Algod node
const algodPort = ""; // Port of your Algod node
const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);
export const newContractInstance = (contractId) =>
  new CONTRACT(
    contractId,
    algodClient,
    {
      ...ARC200Spec,
      methods: [...ARC200Spec.methods, ...ARC200Nonstandard.methods], // mixin non-standard methods
    },
    process.env.WALLET_MNEMONIC
  );
