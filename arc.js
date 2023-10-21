require('dotenv').config();
const algosdk = require('algosdk');

const ARC200 = require('./arc200.js');

const algodToken = '';  // Your Algod API token
const algodServer = process.env.ALGOD_URL;  // Address of your Algod node
const algodPort = '';  // Port of your Algod node

const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

// Load ARC200 specification
const ARC200Spec = require('./ARC200.json');

// Now the methods are created when a new instance is constructed
const IRLToken = new ARC200(6726425, algodClient, ARC200Spec, process.env.WALLET_MNEMONIC);

(async () => {
    const name = await IRLToken.arc200_name();
    console.log(name);
    const totalSupply = await IRLToken.arc200_totalSupply();
    console.log(totalSupply);
    const balance = await IRLToken.arc200_balanceOf('C5NZ5SNL5EMOEVKFW3DS3DBG3FNMIYJAJY3U4I5SRCOXHGY33ML3TGHD24');
    console.log(balance);
})();