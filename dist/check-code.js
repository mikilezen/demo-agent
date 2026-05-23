async function checkCode() {
    const rpcUrl = "https://rpc.testnet.arc.network";
    const contractAddress = "0x812c36A738A50628619C0AaBE4bcA8301F6c8E30";
    console.log(`Checking if contract is deployed at ${contractAddress} on ${rpcUrl}...`);
    try {
        const response = await fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_getCode',
                params: [contractAddress, 'latest']
            })
        });
        const result = await response.json();
        console.log("Response:", JSON.stringify(result, null, 2));
        if (result.result) {
            if (result.result === '0x' || result.result === '0x0' || result.result === '') {
                console.log("\n❌ NO CODE DEPLOYED AT THIS ADDRESS (Address has no contract bytecode).");
            }
            else {
                console.log(`\n✅ CONTRACT CODE IS PRESENT! Size: ${result.result.length - 2} hex chars.`);
            }
        }
        else {
            console.log("\n❌ Failed to query bytecode (no result in response).");
        }
    }
    catch (error) {
        console.error("RPC Error:", error.message);
    }
}
checkCode();
export {};
