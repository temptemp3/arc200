import dotenv from "dotenv";
import arc200 from "../util/arc200.js";
import { checkEnv, checkYOrN } from "../util/check.js";

dotenv.config();

checkEnv();

const contractsData = [
  { contractId: 6778021, contractInstanceName: "VRC200" }, // OpenARc200v1, has touch + grant method
  { contractId: 6779767, contractInstanceName: "VIA" }, // OpenARc200v1, has touch + grant method
  // more tokens here
];

const confirm = async () => {
  const confirmed = await checkYOrN(
    "This script will read the contract's metadata. It will not modify the contract or your account. Continue?"
  );

  if (!confirmed) {
    console.log("Exiting.");
    process.exit(0);
  }
};

(async () => {
  await confirm()
  for (const contractData of contractsData) {
    try {
      console.log("");
      console.log(`Processing ${contractData.contractInstanceName}:`);
      const {
        arc200_name,
        arc200_symbol,
        arc200_totalSupply,
        arc200_decimals,
      } = arc200.init(contractData.contractId);
      await arc200_name();
      await arc200_symbol();
      await arc200_totalSupply();
      await arc200_decimals();
      console.log(`Done processing ${contractData.contractInstanceName}`);
    } catch (error) {
      console.error(
        `Error processing ${contractData.contractInstanceName}:`,
        error
      );
    }
  }
})();
