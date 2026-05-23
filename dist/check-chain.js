async function checkChain() {
    const rpcUrl = "https://rpc.testnet.arc.network";
    try {
        const response = await fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify([
                {
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'eth_chainId',
                    params: []
                },
                {
                    jsonrpc: '2.0',
                    id: 2,
                    method: 'net_version',
                    params: []
                }
            ])
        });
        const result = await response.json();
        console.log("Response:", JSON.stringify(result, null, 2));
    }
    catch (error) {
        console.error("RPC Error:", error.message);
    }
}
checkChain();
export {};
