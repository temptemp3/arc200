const algosdk = require('algosdk');

class CONTRACT {
    constructor(contractId, algodClient, spec, mnemonic) {
        this.contractId = contractId;
        this.algodClient = algodClient;
        this.contractABI = new algosdk.ABIContract(spec);
        this.mnemonic = mnemonic;
        
        for (const methodSpec of spec.methods) {
            const abiMethod = this.contractABI.getMethodByName(methodSpec.name);
            this[methodSpec.name] = async function(...args) {
                return await this.createAndSimulateTxn(abiMethod, args);
            }.bind(this);
        }
    }
    
    async createAndSimulateTxn(abiMethod, args) {
        // Get the suggested transaction parameters
        const params = await this.algodClient.getTransactionParams().do();
        
        // Get the sender address from the mnemonic
        const { addr: senderAddress, sk: privateKey } = algosdk.mnemonicToSecretKey(this.mnemonic);

        // Encode arguments
        const encodedArgs = args.map((arg, index) => {
            return abiMethod.args[index].type.encode(arg);
        });
        
        // Create the application call transaction object
        const txn = algosdk.makeApplicationCallTxnFromObject({
            suggestedParams: {
                ...params,
                flatFee: true,
                fee: 1000
            },
            from: senderAddress,
            appIndex: this.contractId,
            appArgs: [abiMethod.getSelector(), ...encodedArgs],  // Adjust appArgs based on methodSpec and args
        });
        
        // Sign the transaction
        const signedTxn = txn.signTxn(privateKey);
        
        // Construct the simulation request
        const request = new algosdk.modelsv2.SimulateRequest({
            txnGroups: [
                new algosdk.modelsv2.SimulateRequestTransactionGroup({
                    txns: [algosdk.decodeObj(signedTxn)]
                })
            ],
            allowUnnamedResources: true
        });
        
        // Simulate the transaction group
        const response = await this.algodClient.simulateTransactions(request).do();
        return this.handleSimulationResponse(response, abiMethod);
    }
    
    handleSimulationResponse(response, abiMethod) {
        // Handle the simulation results
        const rlog = response.txnGroups[0].txnResults[0].txnResult.logs.pop();
        const rlog_ui = Uint8Array.from(Buffer.from(rlog, 'base64'));
        const res_ui = rlog_ui.slice(4);
        
        // Decode the response based on the methodSpec
        //HACK: Hacking this because the decode function doesn't work on bytes
        let result;
        if (abiMethod.returns.type.childType == 'byte') {
            result = new TextDecoder().decode(res_ui);
        } else {
            result = abiMethod.returns.type.decode(res_ui);
        }
        
        return result;
    }

}

module.exports = CONTRACT;
