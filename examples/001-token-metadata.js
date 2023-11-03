import dotenv from "dotenv";
import { newContractInstance } from "../util/contract.js";
import arc200 from "../util/arc200.js";

dotenv.config();

const contractsData = [
  { contractId: 6778021, contractInstanceName: "VRC200" }, // latest, has touch + grant method
  { contractId: 6779767, contractInstanceName: "VIA" }, // latest, has touch + grant method
];

(async () => {
  for (const contractData of contractsData) {
    try {
      console.log(`Processing ${contractData.contractInstanceName}:`);
      const {
        arc200_name,
        arc200_symbol,
        arc200_totalSupply,
        arc200_decimals,
      } = arc200(newContractInstance(contractData.contractId));
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
