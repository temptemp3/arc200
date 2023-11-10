import algosdk from "algosdk";
import dotenv from "dotenv";
dotenv.config();
export const getAccountAddress = () =>
  algosdk.mnemonicToSecretKey(process.env.WALLET_MNEMONIC).addr;
