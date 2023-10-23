require("dotenv").config();
const algosdk = require("algosdk");

const CONTRACT = require("./contract.js");

const algodToken = ""; // Your Algod API token
const algodServer = process.env.ALGOD_URL; // Address of your Algod node
const algodPort = ""; // Port of your Algod node

const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

// Load ARC200 specification
const ARC200Spec = require("./ARC200.json");

const contractsData = [
  { contractId: 6726425, contractInstanceName: "IRLToken" },
  { contractId: 3905802, contractInstanceName: "VRC200" },
  { contractId: 6728548, contractInstanceName: "VRC200v2" },
];

const BalanceBoxCost = 28500;
const BalanceBoxSize = 33; // [0, ...addrTo.pk]
const AllowanceBoxCost = 28100;
const AllowanceBoxSize = 32; // sha256([1,...addrFrom.pk, ...addrTo.pk])

(async () => {
  for (const contractData of contractsData) {
    try {
      const newContractInstance = () =>
        new CONTRACT(
          contractData.contractId,
          algodClient,
          ARC200Spec,
          process.env.WALLET_MNEMONIC
        );
      const contractInstance = newContractInstance();

      const arc200_name = async () => {
        const name = await contractInstance.arc200_name();
        console.log(`Name: ${name}`);
        return name;
      };

      const arc200_symbol = async () => {
        const symbol = await contractInstance.arc200_symbol();
        console.log(`Symbol: ${symbol}`);
        return symbol;
      };

      const arc200_totalSupply = async () => {
        const totalSupply = await contractInstance.arc200_totalSupply();
        console.log(`Total Supply: ${totalSupply}`);
        return totalSupply;
      };

      const arc200_decimals = async () => {
        const decimals = await contractInstance.arc200_decimals();
        console.log(`Number of Decimals: ${decimals}`);
        return decimals;
      };

      const arc200_balanceOf = async (addr) => {
        const balance = await contractInstance.arc200_balanceOf(addr);
        console.log(`BalanceOf`)
        console.log(`    ${addr}: ${balance}`);
        return balance;
      };

      const arc200_allowance = async (addrSpender, addrFrom) => {
        const allowance = await contractInstance.arc200_allowance(
          addrSpender,
          addrFrom
        );
        console.log(`Allowance`);
        console.log(`    from: ${addrFrom}`);
        console.log(`    to: ${addrSpender}`);
        console.log(`    total: ${allowance}`);

        return allowance;
      };

      const safe_arc200_transfer = async (addrTo, amt) => {
        try {
          const contractInstance = newContractInstance();
          const senderAddress = contractInstance.getSenderAddress();
          console.log(`Transfer`);
          console.log(`    to: ${addrTo}`);
          console.log(`    amount: ${transferAmount}`);
          // -------------------------------------
          // preflight
          //  check balanceOf senderAddress >= amt
          //  check balanceOf addrTo >= 0
          // -------------------------------------
          const balanceOfSender = await contractInstance.arc200_balanceOf(
            senderAddress
          );
          console.log(`    Balance of ${senderAddress}: ${balanceOfSender}`);
          if (balanceOfSender < amt) {
            console.log(
              "    Expect failure due to insufficient funds to transfer"
            );
          }
          const balanceOfAddrTo = await contractInstance.arc200_balanceOf(
            addrTo
          );
          console.log(`    Balance of ${addrTo}: ${balanceOfAddrTo}`);
          if (balanceOfAddrTo <= 0 && this.paymentAmount === 0) {
            console.log(
              "    Expect possible failure due to insufficient funds to pay for balance box"
            );
          }
          // -------------------------------------
          const response = await contractInstance
            .arc200_transfer(addrTo, amt)
            .catch(console.err);
          if (!response?.response) {
            console.log(`    Result: ${response}`);
            return response;
          } else {
            console.log(
              `    Retry with balance box payment (${BalanceBoxCost})`
            );
            contractInstance.setPaymentAmount(BalanceBoxCost);
            const response = await contractInstance
              .arc200_transfer(addrTo, amt)
              .catch(console.err);
            if (!response?.response) {
              console.log(`    Result: ${response}`);
              return response;
            } else {
              console.log("    Failure");
              console.log(`    Result: 0`);
              return 0;
            }
          }
        } catch (e) {
          console.log(e);
        }
      };

      const safe_arc200_transferFrom = async (addrFrom, addrTo, amt) => {
        try {
          const contractInstance = newContractInstance();
          const senderAddress = contractInstance.getSenderAddress();
          console.log(`TransferFrom`);
          console.log(`    from: ${addrFrom}`);
          console.log(`    to: ${addrTo}`);
          console.log(`    amount: ${transferAmount}`);
          // -------------------------------------
          // preflight
          //  check balanceOf addrFrom >= amt
          //  check balanceOf addrTo >= 0
          //  check allowance(senderAddress,addrFrom) >= amt
          // -------------------------------------
          const balanceOfAddrFrom = await contractInstance.arc200_balanceOf(
            addrFrom
          );
          console.log(`    Balance of ${addrFrom}: ${balanceOfAddrFrom}`);
          if (balanceOfAddrFrom < amt) {
            console.log(
              "    Expect failure due to insufficient funds to transfer"
            );
          }
          const balanceOfAddrTo = await contractInstance.arc200_balanceOf(
            addrTo
          );
          console.log(`    Balance of ${addrTo}: ${balanceOfAddrTo}`);
          if (balanceOfAddrTo <= 0 && this.paymentAmount === 0) {
            console.log(
              "    Expect possible failure due to insufficient funds to pay for balance box"
            );
          }
          const allowance = await contractInstance.arc200_allowance(
            addrFrom,
            senderAddress
          );
          console.log(
            `    Allowance from ${addrFrom} to ${senderAddress}: ${allowance}`
          );
          if (allowance < amt) {
            console.log(
              "    Expect failure due to insufficient allowance to transfer"
            );
          }
          // -------------------------------------
          const response = await contractInstance
            .arc200_transferFrom(addrFrom, addrTo, amt)
            .catch(console.err);
          if (!response?.response) {
            console.log(`    Result: ${response}`);
            return response;
          } else {
            console.log(
              `    Retry with balance box payment (${BalanceBoxCost})`
            );
            contractInstance.setPaymentAmount(BalanceBoxCost);
            const response = await contractInstance
              .arc200_transferFrom(addrFrom, addrTo, amt)
              .catch(console.err);
            if (!response?.response) {
              console.log(`    Result: ${response}`);
              return response;
            } else {
              console.log("    Failure");
              console.log(`    Result: 0`);
              return 0;
            }
          }
        } catch (e) {
          console.log(e);
        }
      };

      const safe_arc200_approve = async (addrSpender, amt) => {
        try {
          const contractInstance = newContractInstance();
          console.log(`Approve: ${addrSpender} Amount: ${amt}`);
          // -------------------------------------
          const response = await contractInstance
            .arc200_approve(addrSpender, amt)
            .catch(console.err);
          if (!response?.response) {
            console.log(`    Result: ${response}`);
            return response;
          } else {
            console.log(
              `    Retry with balance box payment (${AllowanceBoxCost})`
            );
            contractInstance.setPaymentAmount(AllowanceBoxCost);
            const response = await contractInstance
              .arc200_approve(addrSpender, amt)
              .catch(console.err);
            if (!response?.response) {
              console.log(`    Result: ${response}`);
              return response;
            } else {
              console.log("    Failure");
              console.log(`    Result: 0`);
              return 0;
            }
          }
        } catch (e) {
          console.log(e);
        }
      };

      const wallet1 =
        "C5NZ5SNL5EMOEVKFW3DS3DBG3FNMIYJAJY3U4I5SRCOXHGY33ML3TGHD24";
      const wallet2 =
        "OOEDQF6YL44JOIFBDXWVNREBXQ4IL53JMTA32R66S7GLKEP5WC4CL4SFLE";
      const wallet3 =
        "BUD2763FMK6EYVKGHWWUN4QKHPSPCVFUEPPI4PQCPGYVPGQ6GNKBX6IXCQ";
      const wallet4 =
        "RTKWX3FTDNNIHMAWHK5SDPKH3VRPPW7OS5ZLWN6RFZODF7E22YOBK2OGPE";
      const wallet5 =
        "ET4L2UGCB67ASL2HRRXSYIH64ELUJBRRGGIF5D7FI46NLHYX7OOG3KVZWM";

      const { addr: senderAddress } = algosdk.mnemonicToSecretKey(
        process.env.WALLET_MNEMONIC
      );

      const transferAmount = 10;

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
      await arc200_balanceOf(wallet2);
      await arc200_balanceOf(wallet3);
      await arc200_balanceOf(wallet4);
      await arc200_balanceOf(wallet5);

      // ALLOWANCES

      await arc200_allowance(wallet1, wallet2);
      await arc200_allowance(wallet4, wallet1);
      await arc200_allowance(wallet1, senderAddress);
      await arc200_allowance(wallet4, senderAddress);

      // TRANSFER

      await safe_arc200_transfer(wallet1, transferAmount);
      await safe_arc200_transfer(wallet5, transferAmount);

      // APPROVE

      await safe_arc200_approve(wallet1, transferAmount);

      // TRANSFER FROM

      await safe_arc200_transferFrom(wallet1, wallet2, transferAmount);
      await safe_arc200_transferFrom(wallet4, wallet1, transferAmount);
      await safe_arc200_transferFrom(wallet4, wallet5, transferAmount);
    } catch (error) {
      console.error(
        `Error processing ${contractData.contractInstanceName}:`,
        error
      );
    }
  }
})();
