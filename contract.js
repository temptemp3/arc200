const algosdk = require("algosdk");

class CONTRACT {
  constructor(contractId, algodClient, spec, mnemonic) {
    this.contractId = contractId;
    this.algodClient = algodClient;
    this.contractABI = new algosdk.ABIContract(spec);
    this.mnemonic = mnemonic;
    this.simulate = true;
    this.paymentAmount = 0;
    this.simulationResultHandler = this.decodeSimulationResponse;
    for (const methodSpec of spec.methods) {
      const abiMethod = this.contractABI.getMethodByName(methodSpec.name);
      this[methodSpec.name] = async function (...args) {
        if (methodSpec.readonly || this.simulate) {
          return await this.createAndSimulateTxn(abiMethod, args);
        } else {
          return await this.createAndSimulateTxn(abiMethod, args);
          // const simulationResult = await this.createAndSimulateTxn(abiMethod, args);
          // return await this.createAndSendTxn(abiMethod, args, simulationResult);
        }
      }.bind(this);
    }
  }

  getSenderAddress() {
    const { addr: senderAddress } = algosdk.mnemonicToSecretKey(this.mnemonic);
    return senderAddress;
  }

  setPaymentAmount(amount) {
    this.paymentAmount = amount;
  }

  setSimulate(simulate) {
    this.simulate = simulate;
  }

  async createAndSendTxn(abiMethod, args, simulationResult) {
    // logic to create and send a real transaction using simulationResult
  }

  async createAndSimulateTxn(abiMethod, args) {
    let response;
    try {
      response = await this.simulateTxn(abiMethod, args);
      return this.handleSimulationResponse(response, abiMethod);
    } catch (error) {
      // console.error('Error in createAndSimulateTxn:', error);
      //throw error; // Re-throw the error after logging it
      return { success: false, response };
    }
  }

  async simulateTxn(abiMethod, args) {
    try {
      // Get the suggested transaction parameters
      const params = await this.algodClient.getTransactionParams().do();

      // Get the sender address from the mnemonic
      const { addr: senderAddress, sk: privateKey } =
        algosdk.mnemonicToSecretKey(this.mnemonic);

      // Encode arguments
      const encodedArgs = args.map((arg, index) => {
        return abiMethod.args[index].type.encode(arg);
      });

      // Create the application call transaction object
      const txn2 = algosdk.makeApplicationCallTxnFromObject({
        suggestedParams: {
          ...params,
          flatFee: true,
          fee: 1000,
        },
        from: senderAddress,
        appIndex: this.contractId,
        appArgs: [abiMethod.getSelector(), ...encodedArgs], // Adjust appArgs based on methodSpec and args
      });
      const txn1 = algosdk.makePaymentTxnWithSuggestedParams(
        senderAddress,
        algosdk.getApplicationAddress(this.contractId),
        this.paymentAmount,
        undefined,
        undefined,
        {
          ...params,
          flatFee: true,
          fee: 1000,
        }
      );

      const txns = [txn1, txn2];

      const txngroup = algosdk.assignGroupID(txns);
      // Sign the transaction
      const stxns = txns.map(algosdk.encodeUnsignedSimulateTransaction);

      // Construct the simulation request
      const request = new algosdk.modelsv2.SimulateRequest({
        txnGroups: [
          new algosdk.modelsv2.SimulateRequestTransactionGroup({
            txns: stxns.map(algosdk.decodeObj),
          }),
        ],
        allowUnnamedResources: true,
        allowEmptySignatures: true,
      });

      // Simulate the transaction group
      const response = await this.algodClient
        .simulateTransactions(request)
        .do();
      return response;
    } catch (error) {
      // console.error('Error in createAndSimulateTxn:', error);
      throw error; // Re-throw the error after logging it
    }
  }

  handleSimulationResponse(response, abiMethod) {
    return this.simulationResultHandler(response, abiMethod);
  }

  decodeSimulationResponse(response, abiMethod) {
    try {
      // Handle the simulation results
      if (response.txnGroups[0].failureMessage) {
        throw response.txnGroups[0].failureMessage;
      }
      const rlog = response.txnGroups[0].txnResults[1].txnResult.logs.pop();
      const rlog_ui = Uint8Array.from(Buffer.from(rlog, "base64"));
      const res_ui = rlog_ui.slice(4);

      // Decode the response based on the methodSpec
      //HACK: Hacking this because the decode function doesn't work on bytes
      let result;
      if (abiMethod.returns.type.childType == "byte") {
        result = new TextDecoder().decode(res_ui);
      } else {
        result = abiMethod.returns.type.decode(res_ui);
      }

      return result;
    } catch (error) {
      // console.error('Error in handleSimulationResponse:', error);
      throw error; // Re-throw the error after logging it
    }
  }
}

module.exports = CONTRACT;
