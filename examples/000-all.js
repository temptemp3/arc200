import algosdk from "algosdk";
import CONTRACT from "../lib/contract.js";
import dotenvv from "dotenv";
import ARC200Spec from "../abi/ARC200.json" assert { type: "json" }; // standard methods
import ARC200Nonstandard from "../abi/ARC200Nonstandard.json" assert { type: "json" }; // add non-standard methods such as hasBalance and hasAllowance
dotenvv.config();

/*
const algosdk = require("algosdk");
const CONTRACT = require("../lib/contract.js");
*/

const algodToken = ""; // Your Algod API token
const algodServer = process.env.ALGOD_URL; // Address of your Algod node
const algodPort = ""; // Port of your Algod node

const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

// Load ARC200 specification
/*
const ARC200Spec = require("../abi/ARC200.json");
const ARC200Nonstandard = require("../abi/ARC200Nonstandard.json"); // add non-standard methods such as hasBalance and hasAllowance
*/

const contractsData = [
  { contractId: 6778021, contractInstanceName: "VRC200" }, // latest, has touch + grant method
];

// minimum amount of tokens to create a balance box
const BalanceBoxCost = 28501;
// unused for information only
const BalanceBoxSize = 33; // [0, ...addrTo.pk]
// unused for information only
// minimum amount of tokens to create an allowance box
const AllowanceBoxCost = 28100;
// unused for information only
const AllowanceBoxSize = 32; // sha256([1,...addrFrom.pk, ...addrTo.pk])

(async () => {
  for (const contractData of contractsData) {
    try {
      const newContractInstance = () =>
        new CONTRACT(
          contractData.contractId,
          algodClient,
          {
            ...ARC200Spec,
            methods: [...ARC200Spec.methods, ...ARC200Nonstandard.methods], // mixin non-standard methods
          },
          process.env.WALLET_MNEMONIC
        );
      const contractInstance = newContractInstance();

      // helper functions

      const arc200_name = async () => {
        const name = await contractInstance.arc200_name();
        console.log(`Name:`);
        console.log({ res: name });
        return name;
      };

      const arc200_symbol = async () => {
        const symbol = await contractInstance.arc200_symbol();
        console.log(`Symbol:`);
        console.log({ res: symbol });
        return symbol;
      };

      const arc200_totalSupply = async () => {
        const totalSupply = await contractInstance.arc200_totalSupply();
        console.log(`Total Supply:`);
        console.log({ res: totalSupply });
        return totalSupply;
      };

      const arc200_decimals = async () => {
        const decimals = await contractInstance.arc200_decimals();
        console.log(`Number of Decimals:`);
        console.log({ res: decimals });
        return decimals;
      };

      const arc200_balanceOf = async (addr) => {
        const balance = await contractInstance.arc200_balanceOf(addr);
        console.log(`BalanceOf ${addr}:`);
        console.log({ res: balance });
        return balance;
      };

      const hasBalance = async (addr) => {
        console.log(`HasBalance ${addr}:`);
        const hasBalance = await contractInstance.hasBalance(addr);
        console.log({ res: hasBalance });
        return hasBalance;
      };

      const arc200_allowance = async (addrFrom, addrSpender) => {
        const allowance = await contractInstance.arc200_allowance(
          addrFrom,
          addrSpender
        );
        console.log(`Allowance from: ${addrFrom} spender: ${addrSpender}`);
        console.log({ res: allowance });
        return allowance;
      };

      const hasAllowance = async (addrFrom, addrSpender) => {
        console.log(`HasAllowance from: ${addrFrom} spender: ${addrSpender}`);
        const hasAllowance = await contractInstance.hasAllowance(
          addrFrom,
          addrSpender
        );
        console.log({ res: hasAllowance });
        return hasAllowance;
      };

      const safe_arc200_transfer = async (addrTo, amt) => {
        try {
          const contractInstance = newContractInstance();
          const addrFrom = contractInstance.getSenderAddress();
          console.log(
            `Transfer from: ${addrFrom} to: ${addrTo} amount: ${amt}`
          );
          const p = async () => {
            const res = await contractInstance
              .arc200_transfer(addrTo, amt)
              .catch(() => {});
            console.log({ res });
            return res;
          };
          const res = await p();
          if (!res?.success) {
            contractInstance.setPaymentAmount(BalanceBoxCost);
            const res = await p();
          }
        } catch (e) {
          console.log(e);
        }
      };

      const safe_arc200_transferFrom = async (addrFrom, addrTo, amt) => {
        try {
          const contractInstance = newContractInstance();
          const addrSpender = contractInstance.getSenderAddress();
          console.log(
            `TransferFrom spender: ${addrSpender} from: ${addrFrom} to: ${addrTo} amount: ${amt}`
          );
          const p = async () => {
            const res = await contractInstance
              .arc200_transferFrom(addrFrom, addrTo, amt)
              .catch(() => {});
            console.log({ res });
            return res;
          };
          const res = await p();
          if (!res?.success) {
            contractInstance.setPaymentAmount(BalanceBoxCost);
            const res = await p();
          }
        } catch (e) {
          console.log(e);
        }
      };

      const safe_arc200_approve = async (addrSpender, amt) => {
        try {
          const contractInstance = newContractInstance();
          console.log(`Approve: ${addrSpender} Amount: ${amt}`);
          const p = async () => {
            const res = await contractInstance
              .arc200_approve(addrSpender, amt)
              .catch(console.err);
            console.log({ res });
            return res;
          };
          const res = await p();
          if (!res?.success) {
            contractInstance.setPaymentAmount(BalanceBoxCost);
            const res = await p();
          }
        } catch (e) {
          console.log(e);
        }
      };

      // main

      const [wallet0, wallet1, wallet2, wallet3, wallet4, wallet5, ...wallets] =
        [
          "G3MSA75OZEJTCCENOJDLDJK7UD7E2K5DNC7FVHCNOV7E3I4DTXTOWDUIFQ",
          "C5NZ5SNL5EMOEVKFW3DS3DBG3FNMIYJAJY3U4I5SRCOXHGY33ML3TGHD24",
          "RTKWX3FTDNNIHMAWHK5SDPKH3VRPPW7OS5ZLWN6RFZODF7E22YOBK2OGPE",
          "OOEDQF6YL44JOIFBDXWVNREBXQ4IL53JMTA32R66S7GLKEP5WC4CL4SFLE",
          "BUD2763FMK6EYVKGHWWUN4QKHPSPCVFUEPPI4PQCPGYVPGQ6GNKBX6IXCQ",
          "ET4L2UGCB67ASL2HRRXSYIH64ELUJBRRGGIF5D7FI46NLHYX7OOG3KVZWM",
        ];

      const { addr: senderAddress } = algosdk.mnemonicToSecretKey(
        process.env.WALLET_MNEMONIC
      );

      const transferAmount = 1;

      console.log(`Processing ${contractData.contractInstanceName}:`);

      console.log(`Sender Address: ${senderAddress}`);

      // TOKEN INFO

      await arc200_name();
      await arc200_symbol();
      await arc200_totalSupply();
      await arc200_decimals();

      // BALANCES

      await arc200_balanceOf(senderAddress);
      await arc200_balanceOf(wallet1);

      await hasBalance(senderAddress);
      await hasBalance(wallet1);

      // ALLOWANCES

      await arc200_allowance(senderAddress, wallet1);
      await arc200_allowance(senderAddress, wallet2);

      await hasAllowance(senderAddress, wallet1);
      await hasAllowance(senderAddress, wallet2);

      // TRANSFER

      await safe_arc200_transfer(senderAddress, transferAmount); // self
      await safe_arc200_transfer(wallet1, transferAmount); // has balance
      await safe_arc200_transfer(wallet2, transferAmount); // no balance box
      await safe_arc200_transfer(wallet3, transferAmount); // no balance box
      await safe_arc200_transfer(wallet4, transferAmount); // no balance box
      await safe_arc200_transfer(wallet5, transferAmount); // no balance box

      // APPROVE

      await safe_arc200_approve(wallet1, transferAmount);
      await safe_arc200_approve(wallet2, transferAmount);

      // TRANSFER FROM

      await safe_arc200_transferFrom(wallet2, wallet1, transferAmount); // ok
      await safe_arc200_transferFrom(wallet2, wallet2, transferAmount); // insufficient allowance
      await safe_arc200_transferFrom(wallet2, wallet3, transferAmount); // no box for receiver

      // -----------------------------------------
      // Touch
      // Non-standard method that allows recovery of funds from
      // drops or overspend from a contract to manager address 
      // -----------------------------------------
      console.log(`Touching contract...`);
      contractInstance.setFee(2000);
      await contractInstance.touch();
      // -----------------------------------------
      console.log(`Done processing ${contractData.contractInstanceName}`);
    } catch (error) {
      console.error(
        `Error processing ${contractData.contractInstanceName}:`,
        error
      );
    }
  }
})();
