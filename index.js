require('dotenv').config();
const algosdk = require('algosdk');

const CONTRACT = require('./arc200.js');

const algodToken = '';  // Your Algod API token
const algodServer = process.env.ALGOD_URL;  // Address of your Algod node
const algodPort = '';  // Port of your Algod node

const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

// Load ARC200 specification
const ARC200Spec = require('./ARC200.json');

// Now the methods are created when a new instance is constructed
const IRLToken = new CONTRACT(6726425, algodClient, ARC200Spec, process.env.WALLET_MNEMONIC);

(async () => {
    const name = await IRLToken.arc200_name();
    console.log(`Name: ${name}`); //TODO: Doesn't Decode Correctly

    const symbol = await IRLToken.arc200_symbol();
    console.log(`Symbol: ${symbol}`); //TODO: Doesn't Decode Correctly
    
    const totalSupply = await IRLToken.arc200_totalSupply();
    console.log(`Total Supply: ${totalSupply}`);
    
    //TODO: Errors Out
    const decimals = await IRLToken.arc200_decimals();
    console.log(`Number of Decimals ${decimals}`);

    const wallet1 = 'C5NZ5SNL5EMOEVKFW3DS3DBG3FNMIYJAJY3U4I5SRCOXHGY33ML3TGHD24';
    const wallet2 = 'OOEDQF6YL44JOIFBDXWVNREBXQ4IL53JMTA32R66S7GLKEP5WC4CL4SFLE';
    const balance = await IRLToken.arc200_balanceOf(wallet1);
    console.log(`Balance of ${wallet1}: ${balance}`);

    const allowance = await IRLToken.arc200_allowance(wallet1, wallet2);
    console.log(`Allowance from: ${wallet1} to: ${wallet2} total: ${allowance}`);
})();