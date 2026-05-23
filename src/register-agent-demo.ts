import { AgoraAgentClient, createVerifiedAgent } from "agentcourt";

// Real Deployed Contract address from your output!
const CONTRACT_ADDRESS = "0x812c36A738A50628619C0AaBE4bcA8301F6c8E30";
const OWNER_ADDRESS = "0x1D1fA7f6fB15cDc66165E8E221ec10429e7F4203";

console.log("=== AgentCourt Staking & Onboarding SDK Demo ===");
console.log(`Target Contract Address: ${CONTRACT_ADDRESS}`);
console.log(`Owner Wallet Address: ${OWNER_ADDRESS}\n`);

// 1. Initialize the client pointing directly to your deployed contract
// Since we don't pass a private key signer, it automatically uses the 'SimulationSigner' fallback,
// which simulates transaction signings and generates mock transaction hashes for safe sandbox testing!
const client = new AgoraAgentClient({
  rpcUrl: "https://rpc.testnet.arc.network",
  contractAddress: CONTRACT_ADDRESS
});

async function runDemo() {
  try {
    // 2. Programmatically approve USDC spending for the AgentCourt contract
    console.log("Step 1: Programmatically authorizing USDC spending...");
    const approveAmount = 100.00; // Staking 100 USDC
    const approveTx = await client.approveUSDC(approveAmount);
    console.log(`✅ USDC Approved! Transaction Hash: ${approveTx}\n`);

    // 3. Register the Agent on-chain with USDC stake and complete Metadata profile
    console.log("Step 2: Programmatically registering the agent on-chain...");
    const registerTx = await client.registerAgentOnChain(100.00, {
      name: "Arbitrage Whale",
      category: "Yield Optimization",
      description: "High-value cross-dex predict market liquidity provisioning",
      policy: "Authorized to run predicting toolsets and settle USDC on-chain."
    });
    console.log(`✅ Agent Registered On-Chain! Transaction Hash: ${registerTx}\n`);

    // 4. Verify that the agent can now query its status on-chain
    console.log("Step 3: Querying the real-time profile of the registered agent...");
    const profile = await client.queryOnChainProfile(OWNER_ADDRESS);
    
    console.log("\n--- Real On-Chain Profile Fetched ---");
    console.log("Status:", profile.status);
    console.log("Agent ID:", profile.id);
    console.log("Owner Address:", profile.owner);
    console.log("USDC Stake:", profile.stake);
    console.log("Reputation Score:", profile.reputation);
    console.log("On-Chain Status Code:", profile.rawStatusCode);
    console.log("On-Chain Status Name:", profile.onChainStatus); // None = 0, Active = 1, Slashed = 2
  } catch (error: any) {
    console.error("Demo failed with error:", error.message);
  }
}

runDemo();
