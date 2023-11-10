import dotenv from "dotenv";
import arc200 from "../util/arc200.js";
import { checkEnv, checkYOrN } from "../util/check.js";

dotenv.config();

checkEnv();

const contractsData = []; // ex) contractsData = [{ contractId: 6778021, contractInstanceName: "VRC200" }, ...]

const confirm = async () => {
  // TODO update confirmMessage (next line)
  const confirmMessage = `This script will read the contract's metadata. It will not modify the contract or your account. Continue?`;
  const confirmed = await checkYOrN(confirmMessage);
  if (!confirmed) {
    console.log("Exiting.");
    process.exit(0);
  }
};

(async () => {
  await confirm()
  // script here
})();
