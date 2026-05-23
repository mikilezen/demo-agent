import { AgoraAgentClient, createVerifiedAgent } from "agentcourt";
// 1. Define the Agent Identity using the wallet address registered in the dashboard
const agentIdentity = createVerifiedAgent({
    id: "arbitrage-whale-03",
    name: "Arbitrage Whale",
    strategy: "High-value cross-dex predict market liquidity provisioning",
    ownerAddress: "0x1D1fA7f6fB15cDc66165E8E221ec10429e7F4203" // MUST match your dashboard connected wallet!
});
// 2. Initialize the client (points automatically to env RPC and Contract addresses)
const gatewayEndpoint = process.env.AGENTCOURT_GATEWAY_ENDPOINT || "http://localhost:3000";
const securityClient = new AgoraAgentClient({
    agent: agentIdentity,
    // Run in Gateway mode to push visual updates to the Arc dashboard
    endpoint: gatewayEndpoint
});
// 3. Secure tool calls in real-time
async function performTrade() {
    console.log("Initiating tool call interceptor...");
    try {
        const tradeResult = await securityClient.callTool("arc.transfer_usdc", {
            to: "0xReceiverMarketMaker",
            amountUsd: 500.00
        }, async () => {
            // Your actual Web3 execution logic runs here only if the policy permits it,
            // and the owner address is verified active and staked on-chain!
            console.log(">>> Executing internal tool action...");
            return { txHash: "0x" + "a".repeat(64), success: true };
        });
        console.log("\n--- Interception Complete ---");
        console.log("Success (ok):", tradeResult.ok);
        console.log("Needs Approval:", tradeResult.needsApproval);
        console.log("Verdict:", tradeResult.event.verdict.action);
        console.log("Reason:", tradeResult.event.verdict.reason);
        console.log("Result Payload:", JSON.stringify(tradeResult.result, null, 2));
    }
    catch (error) {
        console.error("Tool execution failed with error:", error.message);
    }
}
// Execute the demo function
performTrade();
