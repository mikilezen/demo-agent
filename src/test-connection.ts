import { OnChainVerifier } from "agentcourt";

async function testConnection() {
  const contractAddress = "0x1a6389aa779BD3C01B7867bB76a9B51f283f9B3a";
  const rpcUrl = "https://rpc.testnet.arc.network";
  const ownerAddress = "0x1D1fA7f6fB15cDc66165E8E221ec10429e7F4203";

  console.log(`Connecting directly to blockchain via RPC: ${rpcUrl}...`);
  console.log(`Target Contract: ${contractAddress}`);
  console.log(`Querying profile for Owner Address: ${ownerAddress}\n`);

  const verifier = new OnChainVerifier({
    contractAddress,
    rpcUrl
  });

  try {
    const profile = await verifier.queryProfile(ownerAddress);
    console.log("--- Real On-Chain Profile Fetched Successfully ---");
    console.log("Status:", profile.status); // e.g. 'verified', 'unregistered', 'sandbox'
    console.log("Agent ID:", profile.id);
    console.log("Owner Address:", profile.owner);
    console.log("USDC Stake:", profile.stake);
    console.log("Reputation Score:", profile.reputation);
    console.log("On-Chain Status Code:", profile.rawStatusCode);
    console.log("On-Chain Status Name:", profile.onChainStatus); // None = 0, Active = 1, Slashed = 2
    if (profile.error) {
      console.log("Profile Error:", profile.error);
    }
    if (profile.reason) {
      console.log("Reason Info:", profile.reason);
    }
  } catch (error: any) {
    console.error("Direct on-chain connection failed!");
    console.error("Error Message:", error.message);
    if (error.metadata) {
      console.error("Error Metadata:", JSON.stringify(error.metadata, null, 2));
    }
  }
}

testConnection();
