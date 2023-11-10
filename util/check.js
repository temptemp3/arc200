import * as fs from "fs";
import * as rl from "readline";

/*
 * checkEqual
 * check if two values are equal
 * @param {any} a
 * @param {any} b
 * @returns: void
 * @throws: Error
 */
export const checkEqual = (a, b, msg) => {
  if (a !== b) {
    throw new Error(`${a} !== ${b}`, msg);
  } else {
    console.log(`\x1b[36m%s\x1b[0m[OK] ${msg}`);
  }
};

/*
 * checkYOrN
 * ask user for confirmation
 * @param {string} message - message to display to user
 * @returns: bool
 * @throws: Error
 */
export const checkYOrN = async (message) => {
  const readline = rl.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    readline.question(`${message} (y/N) `, (answer) => {
      readline.close();
      resolve(answer.toLowerCase() === "y");
    });
  });
};

/*
 * checkEnv
 * check for existence of .env file
 * @returns: void
 * @throws: Error
 */
export const checkEnv = () => {
  if (!fs.existsSync(".env")) {
    throw new Error(
      [
        ".env file not found.",
        "Please create file.",
        "Use .env.sample as a template. Run `cp .env{.sample,}` in terminal.",
        "Defaults use Voi Testnet. See WALLET_MNEMONIC if needed.",
      ].join()
    );
  }
};
