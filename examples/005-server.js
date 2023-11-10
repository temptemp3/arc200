// app.js
import express from "express";
import algosdk from "algosdk";
import arc200 from "../util/arc200.js";

const app = express();
const port = 5001;

const algodToken = ""; // Your Algod API token
const algodServer = process.env.ALGOD_URL; // Address of your Algod node
const algodPort = ""; // Port of your Algod node
const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

// Sample data for demonstration
const tokenData = {
  arc200_name: "Sample Token",
  arc200_symbol: "ST",
  arc200_totalSupply: 1000000,
  arc200_decimals: 18,
};

// Helper function to prepare string
const prepareString = (str) => {
  const index = str.indexOf("\x00");
  if (index > 0) {
    return str.slice(0, str.indexOf("\x00"));
  } else {
    return str;
  }
};

// Middleware to check if tokenId is a valid number
const validateTokenId = (req, res, next) => {
  const { tokenId } = req.params;

  if (!Number.isNaN(Number(tokenId))) {
    next();
  } else {
    res
      .status(400)
      .json({ success: false, error: "Invalid tokenId. Must be a number." });
  }
};

// Define a route
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Define a helper function to handle common error responses
function handleErrorResponse(res, error) {
  console.error(error);
  res.status(500).json({ success: false, error: "Internal Server Error" });
}

// Define a common route handler for ABI methods
async function handleAbiMethod(req, res, methodName) {
  try {
    const { tokenId } = req.params;
    const arc200Instance = arc200.init(Number(tokenId));
    const { success, returnValue } = await arc200Instance[methodName]();

    if (success) {
      res.json({ success: true, response: prepareString(returnValue) });
    } else {
      res.status(404).json({ success: false, error: "Token not found" });
    }
  } catch (error) {
    handleErrorResponse(res, error);
  }
}

// Routes for each ABI method with updated paths
app.get("/assets/:tokenId/name", validateTokenId, async (req, res) => {
  await handleAbiMethod(req, res, "arc200_name");
});

app.get("/assets/:tokenId/symbol", validateTokenId, async (req, res) => {
  await handleAbiMethod(req, res, "arc200_symbol");
});

app.get("/assets/:tokenId/totalSupply", validateTokenId, async (req, res) => {
  await handleAbiMethod(req, res, "arc200_totalSupply");
});

app.get("/assets/:tokenId/decimals", validateTokenId, async (req, res) => {
  await handleAbiMethod(req, res, "arc200_decimals");
});

app.get("/assets/:tokenId", validateTokenId, async (req, res) => {
  try {
    const { tokenId } = req.params;
    const arc200Instance = arc200.init(Number(tokenId));

    const nameResponse = await arc200Instance.arc200_name();
    const symbolResponse = await arc200Instance.arc200_symbol();
    const totalSupplyResponse = await arc200Instance.arc200_totalSupply();
    const decimalsResponse = await arc200Instance.arc200_decimals();

    if (
      nameResponse.success &&
      symbolResponse.success &&
      totalSupplyResponse.success &&
      decimalsResponse.success
    ) {
      const combinedResponse = {
        asset: {
          index: tokenId,
          name: prepareString(nameResponse.returnValue),
          symbol: prepareString(symbolResponse.returnValue),
          totalSupply: `${totalSupplyResponse.returnValue}`,
          decimals: `${decimalsResponse.returnValue}`,
        },
      };

      res.json({ success: true, response: combinedResponse });
    } else {
      res.status(404).json({ success: false, error: "Token not found" });
    }
  } catch (error) {
    handleErrorResponse(res, error);
  }
});

app.get(
  "/assets/:tokenId/transfer/:addrFrom/:addrTo/:amt",
  validateTokenId,
  async (req, res) => {
    try {
      const { tokenId, addrFrom, addrTo, amt } = req.params;
      const arc200Instance = arc200.init(Number(tokenId), { addr: addrFrom });
      const transferResponse = await arc200Instance.safe_arc200_transfer(
        addrTo,
        Number(amt)
      );

      if (transferResponse.success) {
        res.json({ success: true, response: transferResponse.txns });
      } else {
        res
          .status(400)
          .json({
            success: false,
            error: "Transfer failed",
            details: transferResponse.error,
          });
      }
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }
);

// Start the server
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
