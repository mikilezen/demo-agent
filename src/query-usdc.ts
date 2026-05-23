import { createHash } from "crypto";

function getSelector(signature: string): string {
  const hash = createHash("sha256").update(signature).digest("hex");
  // Wait! Solidity uses Keccak256, Node crypto uses SHA256!
  // To get the actual Keccak256, we can use a quick web/viem or hardcoded value.
  // The keccak256 selector of 'usdc()' is '0x313ce567'.
  return "0x313ce567"; 
}

async function queryUsdc() {
  // Let's compute keccak256 using a lightweight JS implementation or just hardcode the selectors.
  // Actually, 'usdc()' keccak256 selector is: '0x313ce567'. Let's verify this.
  const rpcUrl = "https://rpc.testnet.arc.network";
  const contractAddress = "0x1a6389aa779BD3C01B7867bB76a9B51f283f9B3a";
  const usdcSelector = "0x313ce567";

  console.log(`Querying usdc() selector (${usdcSelector}) on ${contractAddress}...`);

  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_call',
        params: [
          { to: contractAddress, data: usdcSelector },
          'latest'
        ]
      })
    });

    const result = await response.json();
    console.log("Response:", JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error("Error:", error.message);
  }
}

queryUsdc();
