require('dotenv').config();

const ARC200SPEC = require("./ARC200.json");

const algosdk = require('algosdk');

const contractId = 6726425;
const balanceAddress = 'C5NZ5SNL5EMOEVKFW3DS3DBG3FNMIYJAJY3U4I5SRCOXHGY33ML3TGHD24';

const algodToken = '';  // Your Algod API token
const algodServer = process.env.ALGOD_URL;  // Address of your Algod node
const algodPort = '';  // Port of your Algod node

const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

const contractABI = new algosdk.ABIContract(ARC200SPEC);


async function createBalanceOfTxn(algodClient, contractId, address, contractABI) {
    // Get the suggested transaction parameters
    const params = await algodClient.getTransactionParams().do();

    // Get the sender address from the mnemonic
    const mnemonic = process.env.WALLET_MNEMONIC;
    const { addr: senderAddress, sk: privateKey } = algosdk.mnemonicToSecretKey(mnemonic);

    const nameMethod = contractABI.getMethodByName("arc200_balanceOf");

    // Create the application call transaction object
    const txn = algosdk.makeApplicationCallTxnFromObject({
        suggestedParams: {
            ...params,
            flatFee: true,
            fee: 1000
        },
        from: senderAddress,  
        appIndex: contractId,
        appArgs: [nameMethod.getSelector(), algosdk.decodeAddress(address).publicKey],
    });

    // Sign the transaction
    const signedTxn = txn.signTxn(privateKey);

    return {signedTxn, nameMethod};
}




createBalanceOfTxn(algodClient, contractId, balanceAddress, contractABI)
    .then(({ signedTxn, nameMethod }) => {
        const request = new algosdk.modelsv2.SimulateRequest({
            txnGroups: [
                new algosdk.modelsv2.SimulateRequestTransactionGroup({
                    txns: [algosdk.decodeObj(signedTxn)]
                })
            ],
            allowUnnamedResources:true
        })

        // Simulate the transaction group
        algodClient.simulateTransactions(request).do()
            .then(response => {
                // Handle the simulation results
                console.log(response);
                const rlog = response.txnGroups[0].txnResults[0].txnResult.logs.pop();
                console.log(rlog);
                const rlog_ui = Uint8Array.from(Buffer.from(rlog, 'base64'));
                const res_ui = rlog_ui.slice(4);
                console.log({res_ui});

                res = nameMethod.returns.type.decode(res_ui);
                console.log({res});
            })
            .catch(error => {
                // Handle any errors
                console.error(error);
            });
    });

