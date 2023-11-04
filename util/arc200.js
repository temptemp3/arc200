import CONTRACT from "../lib/contract.js";
import ARC200Spec from "../abi/arc/200/contract.json" assert { type: "json" }; // spec
import ARC200Extension from "../abi/arc/200/extension.json" assert { type: "json" }; // extension (non-standard methods)
import algosdk from "algosdk";
import dotenv from "dotenv";
dotenv.config();
const algodToken = ""; // Your Algod API token
const algodServer = process.env.ALGOD_URL; // Address of your Algod node
const algodPort = ""; // Port of your Algod node
const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

/*
 * init
 * - initialize contract instance
 * @param contractId: contract id
 * @returns: contract instance
 * @example:
 * const contractInstance = init(contractId);
 * const name = await contractInstance.arc200_name();
 * console.log({ name });
 * ...
 */
export const init = (contractId) =>
  new CONTRACT(
    contractId,
    algodClient,
    {
      ...ARC200Spec,
      methods: [...ARC200Spec.methods, ...ARC200Extension.methods], // mixin non-standard methods
    },
    process.env.WALLET_MNEMONIC
  );

/*
 * arc200_name
 * - get name
 * @param contractInstance: contract instance
 * @returns: name (String)
 */
export const arc200_name = async (contractInstance) => {
  const name = await contractInstance.arc200_name();
  console.log(`Name:`);
  console.log({ res: name });
  return name;
};

/*
 * arc200_symbol
 * - get symbol
 * @param contractInstance: contract instance
 * @returns: symbol (String)
 */
export const arc200_symbol = async (contractInstance) => {
  const symbol = await contractInstance.arc200_symbol();
  console.log(`Symbol:`);
  console.log({ res: symbol });
  return symbol;
};

/*
 * arc200_totalSupply
 * - get total supply
 * @param contractInstance: contract instance
 * @returns: total supply (Int)
 */
export const arc200_totalSupply = async (contractInstance) => {
  const totalSupply = await contractInstance.arc200_totalSupply();
  console.log(`Total Supply:`);
  console.log({ res: totalSupply });
  return totalSupply;
};

/*
 * arc200_decimals
 * - get number of decimals
 * @param contractInstance: contract instance
 * @returns: number of decimals (Int)
 */
export const arc200_decimals = async (contractInstance) => {
  const decimals = await contractInstance.arc200_decimals();
  console.log(`Number of Decimals:`);
  console.log({ res: decimals });
  return decimals;
};

/*
 * arc200_balanceOf
 * - get balance of addr
 * @param contractInstance: contract instance
 * @param addr: address to check
 * @returns: balance (Int)
 */
export const arc200_balanceOf = async (contractInstance, addr) => {
  const balance = await contractInstance.arc200_balanceOf(addr);
  console.log(`BalanceOf ${addr}:`);
  console.log({ res: balance });
  return balance;
};

/*
 * hasBalance
 * - check if addr has balance
 * @param contractInstance: contract instance
 * @param addr: address to check
 * @returns: bool
 */
export const hasBalance = async (contractInstance, addr) => {
  console.log(`HasBalance ${addr}:`);
  const hasBalance = await contractInstance.hasBalance(addr);
  console.log({ res: hasBalance });
  return hasBalance;
};

/*
 * arc200_allowance
 * - check if spender is allowed to spend from addrFrom
 * @param contractInstance: contract instance
 * @param addrFrom: from address
 * @param addrSpender: spender address
 * @returns: allowance (Int)
 */
export const arc200_allowance = async (
  contractInstance,
  addrFrom,
  addrSpender
) => {
  const allowance = await contractInstance.arc200_allowance(
    addrFrom,
    addrSpender
  );
  console.log(`Allowance from: ${addrFrom} spender: ${addrSpender}`);
  console.log({ res: allowance });
  return allowance;
};

/*
 * hasAllowance
 * - check if spender is allowed to spend from addrFrom
 * @param contractInstance: contract instance
 * @param addrFrom: from address
 * @param addrSpender: spender address
 * @returns: bool
 */
export const hasAllowance = async (contractInstance, addrFrom, addrSpender) => {
  console.log(`HasAllowance from: ${addrFrom} spender: ${addrSpender}`);
  const hasAllowance = await contractInstance.hasAllowance(
    addrFrom,
    addrSpender
  );
  console.log({ res: hasAllowance });
  return hasAllowance;
};

/*
 * safe_arc200_transfer
 * - send
 * @param ci: contract instance
 * @param addrTo: to address
 * @param amt: amount to send
 * @returns: undefined
 */
export const safe_arc200_transfer = async (ci, addrTo, amt) => {
  try {
    const contractInstance = newContractInstance(ci.getContractId());
    const addrFrom = contractInstance.getSenderAddress();
    console.log(`Transfer from: ${addrFrom} to: ${addrTo} amount: ${amt}`);
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

/*
 * safe_arc200_transferFrom
 * - spend
 * @param ci: contract instance
 * @param addrFrom: from address
 * @param addrTo: to address
 * @param amt: amount to spend
 * @returns: undefined
 */
export const safe_arc200_transferFrom = async (ci, addrFrom, addrTo, amt) => {
  try {
    const contractInstance = newContractInstance(ci.getContractId());
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

/*
 * safe_arc200_approve
 * - approve spending
 * @param ci: contract instance
 * @param addrSpender: spender address
 * @param amt: amount to approve
 * @returns: undefined
 */

export const safe_arc200_approve = async (ci, addrSpender, amt) => {
  try {
    const contractInstance = newContractInstance(ci.getContractId());
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

export default {
  init: (contractId) =>
    ((contractInstance) => ({
      arc200_name: async () => await arc200_name(contractInstance),
      arc200_symbol: async () => await arc200_symbol(contractInstance),
      arc200_totalSupply: async () =>
        await arc200_totalSupply(contractInstance),
      arc200_decimals: async () => await arc200_decimals(contractInstance),
      arc200_balanceOf: async (addr) =>
        await arc200_balanceOf(contractInstance, addr),
      arc200_allowance: async (addrFrom, addrSpender) =>
        await arc200_allowance(contractInstance, addrFrom, addrSpender),
      safe_arc200_transfer: async (addrTo, amt) =>
        await safe_arc200_transfer(contractInstance, addrTo, amt),
      safe_arc200_transferFrom: async (addrFrom, addrTo, amt) =>
        await safe_arc200_transferFrom(contractInstance, addrFrom, addrTo, amt),
      safe_arc200_approve: async (addrSpender, amt) =>
        await safe_arc200_approve(contractInstance, addrSpender, amt),
      hasBalance: async (addr) => await hasBalance(contractInstance, addr),
      hasAllowance: async (addrFrom, addrSpender) =>
        await hasAllowance(contractInstance, addrFrom, addrSpender),
    }))(init(contractId)),
};
