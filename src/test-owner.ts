async function testOwner() {
  const rpcUrl = "https://rpc.testnet.arc.network";
  const contractAddress = "0x1a6389aa779BD3C01B7867bB76a9B51f283f9B3a";
  const ownerSelector = "0x8da8103f"; // selector for owner()

  console.log(`Querying owner() at contract ${contractAddress}...`);

  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_call',
        params: [
          { to: contractAddress, data: ownerSelector },
          'latest'
        ]
      })
    });

    const result = await response.json();
    console.log("Response:", JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error("RPC Error:", error.message);
  }
}

testOwner();
