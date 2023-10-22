require('dotenv').config();
const algosdk = require('algosdk');

const CONTRACT = require('./contract.js');

const algodToken = '';  // Your Algod API token
const algodServer = process.env.ALGOD_URL;  // Address of your Algod node
const algodPort = '';  // Port of your Algod node

const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

// Load ARC200 specification
const ARC200Spec = require('./ARC200.json');

const contractsData = [
    { contractId: 6726425, contractInstanceName: "IRLToken" },
    { contractId: 3905802, contractInstanceName: "VRC200" }
];

(async () => {
    for (const contractData of contractsData) {
        try {
            const contractInstance = new CONTRACT(contractData.contractId, algodClient, ARC200Spec, process.env.WALLET_MNEMONIC);
            console.log(`Processing ${contractData.contractInstanceName}:`);

            const name = await contractInstance.arc200_name();
            console.log(`Name: ${name}`);

            const symbol = await contractInstance.arc200_symbol();
            console.log(`Symbol: ${symbol}`);

            const totalSupply = await contractInstance.arc200_totalSupply();
            console.log(`Total Supply: ${totalSupply}`);

            const decimals = await contractInstance.arc200_decimals();
            console.log(`Number of Decimals: ${decimals}`);

            const wallet1 = 'C5NZ5SNL5EMOEVKFW3DS3DBG3FNMIYJAJY3U4I5SRCOXHGY33ML3TGHD24';
            const wallet2 = 'OOEDQF6YL44JOIFBDXWVNREBXQ4IL53JMTA32R66S7GLKEP5WC4CL4SFLE';
            const wallet3 = '3JOOMFDHWZ2YM2WD2HRPR6Q2DJ6KXH4WES3ZSYFVPZ3ORJQPNLL7LKNJRM';
            const wallet4 = 'BUD2763FMK6EYVKGHWWUN4QKHPSPCVFUEPPI4PQCPGYVPGQ6GNKBX6IXCQ';

            const balance = await contractInstance.arc200_balanceOf(wallet1);
            console.log(`Balance of ${wallet1}: ${balance}`);

            const allowance = await contractInstance.arc200_allowance(wallet1, wallet2);
            console.log(`Allowance from: ${wallet1} to: ${wallet2} total: ${allowance}`);

            const transfer = await contractInstance.arc200_transfer(wallet4, 1);
            console.log(transfer);

            const transferFrom = await contractInstance.arc200_transferFrom(wallet1, wallet2, 1);
            console.log(transferFrom);

            //TODO: Errors Out
            const approve = await contractInstance.arc200_approve(wallet1, 0);
            console.log(approve);
        } catch (error) {
            console.error(`Error processing ${contractData.contractInstanceName}:`, error);
        }
    }
})();
