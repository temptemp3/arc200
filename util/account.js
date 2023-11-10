import algosdk from "algosdk";
import dotenv from "dotenv";
dotenv.config();
const algodToken = ""; // Your Algod API token
const algodServer = process.env.ALGOD_URL; // Address of your Algod node
const algodPort = ""; // Port of your Algod node
const indexerClient = new algosdk.Indexer(
  algodToken,
  algodServer,
  algodPort
);
const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);
export const getAccountInfo = async (addr) =>
  await algodClient.accountInformation(addr).do();
