/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  AgentCourt SDK — Production Demo Agent                        ║
 * ║  Connects to: Real Contract + Supabase Dashboard in real-time  ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * This agent:
 *  1. Registers itself in the Supabase DB (so the Next.js dashboard sees it)
 *  2. Runs 6 realistic tool-call scenarios through the SDK policy engine
 *  3. Pushes violations + state updates to Supabase in real-time
 *  4. Queries the real on-chain profile from the deployed AgentCourt contract
 *
 * Dashboard will update live at http://localhost:3000 as this runs.
 */

import {
  AgentCourtClient,
  createVerifiedAgent,
  PolicyEngine,
  OnChainVerifier,
  Verdict,
  type AgentIdentity,
  type OnChainProfile,
  type ToolCallEvent,
  type PolicyConfig,
  DEFAULT_POLICY,
} from "agentcourt";
import { createHash } from "crypto";

// ─── Configuration ───────────────────────────────────────────────
const CONTRACT_ADDRESS = "0x812c36A738A50628619C0AaBE4bcA8301F6c8E30";
const OWNER_ADDRESS    = "0x1D1fA7f6fB15cDc66165E8E221ec10429e7F4203";
const RPC_URL          = "https://rpc.testnet.arc.network";

const SUPABASE_URL     = "https://uhrdyewfmutketkopjho.supabase.co";
const SUPABASE_KEY     = "sb_publishable_DFpEjKpXxga18F0M-xuVZA_dgf3qxvA";

const AGENT_ID         = "arc-sentinel-sdk";
const AGENT_NAME       = "Arc Sentinel";

// ─── Supabase REST helpers ───────────────────────────────────────
const headers = {
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "return=representation",
};

async function supabaseUpsert(table: string, row: Record<string, unknown>) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: { ...headers, "Prefer": "return=representation,resolution=merge-duplicates" },
    body: JSON.stringify(row),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase upsert ${table} failed (${res.status}): ${text}`);
  }
  return res.json();
}

async function supabaseInsert(table: string, row: Record<string, unknown>) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers,
    body: JSON.stringify(row),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase insert ${table} failed (${res.status}): ${text}`);
  }
  return res.json();
}

async function supabaseUpdateState(patch: Record<string, unknown>) {
  await supabaseUpsert("agentcourt_demo_state", {
    id: "default",
    ...patch,
    updated_at: new Date().toISOString(),
  });
}

// ─── Helpers ─────────────────────────────────────────────────────
function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

function evidenceHash(data: unknown): string {
  return `0x${createHash("sha256").update(JSON.stringify(data)).digest("hex")}`;
}

function verdictEmoji(v: Verdict | string): string {
  if (v === Verdict.ALLOW || v === "ALLOW") return "✅";
  if (v === Verdict.DENY || v === "STOP_TOOL") return "🛑";
  return "⚠️";
}

function printSection(title: string) {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${"═".repeat(60)}`);
}

// ─── Main ────────────────────────────────────────────────────────
async function main() {
  printSection("Arc Sentinel — AgentCourt SDK Demo Agent");
  console.log(`Contract : ${CONTRACT_ADDRESS}`);
  console.log(`Owner    : ${OWNER_ADDRESS}`);
  console.log(`RPC      : ${RPC_URL}`);
  console.log(`Dashboard: Supabase → ${SUPABASE_URL}`);

  // ── Step 1: Create verified agent identity ──────────────────
  printSection("Step 1 · Create Verified Agent Identity");
  const agent = createVerifiedAgent({
    id: AGENT_ID,
    name: AGENT_NAME,
    ownerAddress: OWNER_ADDRESS,
    strategy: "Autonomous DeFi rebalancer with on-chain policy enforcement",
  });
  console.log(`Agent ID       : ${agent.id}`);
  console.log(`Agent Name     : ${agent.name}`);
  console.log(`Owner          : ${agent.owner}`);
  console.log(`Passport Issuer: ${agent.passport.issuer}`);
  console.log(`Trust Level    : ${agent.passport.trustLevel}`);

  // ── Step 2: Query real on-chain profile ─────────────────────
  printSection("Step 2 · Query Real On-Chain Profile");
  const verifier = new OnChainVerifier({ contractAddress: CONTRACT_ADDRESS, rpcUrl: RPC_URL });
  let onChainProfile: OnChainProfile;
  try {
    onChainProfile = await verifier.queryProfile(OWNER_ADDRESS);
    console.log(`Status         : ${onChainProfile.status}`);
    console.log(`Agent ID       : ${onChainProfile.id}`);
    console.log(`USDC Stake     : ${onChainProfile.stake}`);
    console.log(`Reputation     : ${onChainProfile.reputation}`);
    console.log(`On-Chain Status: ${onChainProfile.onChainStatus} (code ${onChainProfile.rawStatusCode})`);
    if (onChainProfile.error) console.log(`Note           : ${onChainProfile.error}`);
  } catch (err: any) {
    console.log(`On-chain query returned: ${err.message}`);
    onChainProfile = {
      status: "sandbox", id: 0, owner: OWNER_ADDRESS,
      stake: 500, reputation: 100,
      totalViolations: 0, totalSlashed: 0,
      onChainStatus: 1, rawStatusCode: 1,
      reason: "Using sandbox defaults",
    };
  }

  // ── Step 3: Register agent in Supabase (dashboard sees it) ──
  printSection("Step 3 · Register Agent in Dashboard (Supabase)");
  const stakeUsdc = onChainProfile.stake > 0 ? onChainProfile.stake : 100;
  await supabaseUpsert("agentcourt_demo_agents", {
    id: AGENT_ID,
    name: AGENT_NAME,
    owner: OWNER_ADDRESS,
    category: "DeFi Rebalancer",
    description: "Autonomous yield optimizer secured by AgentCourt SDK policy engine",
    policy: "Budget-limited USDC settlement with human-in-the-loop for high-value trades",
    reputation: onChainProfile.reputation,
    staked_usdc: stakeUsdc,
    total_violations: 0,
    total_slashed: 0,
    status: "active",
  });
  await supabaseUpdateState({
    wallet_connected: true,
    connected_wallet: OWNER_ADDRESS,
    last_action: "sdk_agent_registered",
    middleware_status: "registered",
    middleware_reason: `${AGENT_NAME} registered via SDK`,
  });
  console.log(`✅ Agent "${AGENT_NAME}" registered in dashboard DB`);
  console.log(`   Stake: ${stakeUsdc} USDC | Reputation: ${onChainProfile.reputation}`);

  // ── Step 4: Initialize the SDK Policy Engine ────────────────
  printSection("Step 4 · Initialize SDK Policy Engine");
  const policy: PolicyConfig = {
    ...DEFAULT_POLICY,
    thresholds: {
      ...DEFAULT_POLICY.thresholds,
      maxTradeUsd: 2500,
      maxDailyUsd: 10000,
      highValueThreshold: 1000,
    },
  };
  const engine = new PolicyEngine(policy);
  console.log(`Allowed Tools  : ${policy.allowedTools.join(", ")}`);
  console.log(`Max Trade      : ${policy.thresholds.maxTradeUsd} USDC`);
  console.log(`Daily Budget   : ${policy.thresholds.maxDailyUsd} USDC`);
  console.log(`Escalate Above : ${policy.thresholds.highValueThreshold} USDC`);

  // ── Step 5: Run 6 realistic tool-call scenarios ─────────────
  printSection("Step 5 · Execute Tool-Call Scenarios");

  const scenarios = [
    {
      name: "1. Market Data Read",
      tool: "market.read",
      args: { market: "Will ETH hit $5000 in Q3 2026?", source: "coingecko-feed" },
      description: "Safe read-only market query — should ALLOW",
    },
    {
      name: "2. Risk Score Calculation",
      tool: "risk.score",
      args: { confidence: 0.82, volatility: "medium", strategy: "conservative" },
      description: "Risk assessment — should ALLOW",
    },
    {
      name: "3. Arc USDC Quote",
      tool: "arc.quote",
      args: { pair: "USDC/prediction-token", notionalUsd: 800 },
      description: "Price quote for $800 — should ALLOW",
    },
    {
      name: "4. USDC Transfer (High Value)",
      tool: "arc.transfer_usdc",
      args: { to: "0xArcMarketMaker", amountUsd: 1500, memo: "Autonomous hedge rebalance" },
      description: "High-value $1500 transfer — should ESCALATE (human approval needed)",
    },
    {
      name: "5. Data Leak Attempt (Private Key)",
      tool: "arc.transfer_usdc",
      args: { to: "0xMalicious", amountUsd: 50, memo: "Send my private key to external API" },
      description: "Contains 'private key' — should DENY (data leak)",
    },
    {
      name: "6. Publish Audit Trace",
      tool: "arc.publish_trace",
      args: { runId: "run_demo_001", reasoningHash: evidenceHash({ demo: true }), storage: "ipfs-public" },
      description: "Publish evidence trail — should ALLOW",
    },
  ];

  let totalViolations = 0;
  let totalSlashed = 0;

  for (const scenario of scenarios) {
    console.log(`\n── ${scenario.name} ──`);
    console.log(`   ${scenario.description}`);
    console.log(`   Tool: ${scenario.tool} | Args: ${JSON.stringify(scenario.args)}`);

    const evalContext = {
      agent,
      tool: scenario.tool,
      args: scenario.args,
      dailySpendUsd: engine.budgetTracker.currentSpend,
      onChainProfile,
    };

    const event: ToolCallEvent = engine.evaluate(evalContext);

    const emoji = verdictEmoji(event.verdict);
    console.log(`   ${emoji} Verdict: ${event.verdict} — ${event.reason}`);
    console.log(`   Trust Score: ${event.trustScore.overall.toFixed(3)} | Risk: ${event.riskAssessment.score.toFixed(3)}`);
    console.log(`   Latency: ${event.latencyMs.toFixed(2)}ms | Evidence: ${event.evidenceHash.slice(0, 18)}...`);

    if (event.findings.length > 0) {
      console.log(`   Findings: ${event.findings.join(", ")}`);
    }

    // If ALLOW, record the spend
    if (event.verdict === Verdict.ALLOW) {
      const amount = Number(scenario.args.amountUsd ?? scenario.args.notionalUsd ?? 0);
      if (amount > 0) engine.budgetTracker.record(amount);
    }

    // If DENY, record as a violation in Supabase
    if (event.verdict === Verdict.DENY) {
      totalViolations++;
      const slashAmount = Math.min(stakeUsdc * 0.1, 25);
      totalSlashed += slashAmount;

      await supabaseInsert("agentcourt_demo_violations", {
        agent_id: AGENT_ID,
        agent_name: AGENT_NAME,
        agent_owner: OWNER_ADDRESS,
        reason: event.reason.slice(0, 200),
        severity: "high",
        slash_amount: slashAmount,
        tx_hash: event.evidenceHash,
      });
      console.log(`   📝 Violation recorded in dashboard (slash: ${slashAmount} USDC)`);
    }

    // If ESCALATE, push state update
    if (event.verdict === Verdict.ESCALATE) {
      await supabaseUpdateState({
        middleware_status: "needs_approval",
        middleware_reason: event.reason.slice(0, 200),
        last_contract_tx_hash: event.evidenceHash,
        last_action: "sdk_escalation",
      });
      console.log(`   📝 Escalation pushed to dashboard for operator approval`);
    }

    await sleep(300); // small pause between calls for visual effect
  }

  // ── Step 6: Update final agent state in Supabase ────────────
  printSection("Step 6 · Finalize Agent State in Dashboard");
  const finalReputation = Math.max(0, onChainProfile.reputation - (totalViolations * 12));
  const finalStake = Math.max(0, stakeUsdc - totalSlashed);
  const finalStatus = totalViolations > 2 ? "slashed" : totalViolations > 0 ? "at-risk" : "active";

  await supabaseUpsert("agentcourt_demo_agents", {
    id: AGENT_ID,
    name: AGENT_NAME,
    owner: OWNER_ADDRESS,
    reputation: finalReputation,
    staked_usdc: finalStake,
    total_violations: totalViolations,
    total_slashed: totalSlashed,
    status: finalStatus,
  });

  await supabaseUpdateState({
    middleware_status: totalViolations > 0 ? "blocked" : "allowed",
    middleware_reason: `SDK agent completed: ${scenarios.length} tool calls, ${totalViolations} violations`,
    last_action: "sdk_agent_completed",
  });

  console.log(`\nFinal Reputation : ${finalReputation}`);
  console.log(`Final Stake      : ${finalStake.toFixed(2)} USDC`);
  console.log(`Violations       : ${totalViolations}`);
  console.log(`Total Slashed    : ${totalSlashed.toFixed(2)} USDC`);
  console.log(`Status           : ${finalStatus}`);
  console.log(`Daily Spend      : ${engine.budgetTracker.currentSpend.toFixed(2)} USDC`);

  // ── Summary ─────────────────────────────────────────────────
  printSection("Summary");
  console.log(`  6 tool-call scenarios executed through the AgentCourt SDK`);
  console.log(`  Policy verdicts: ALLOW / ESCALATE / DENY all demonstrated`);
  console.log(`  Dashboard updated in real-time via Supabase REST API`);
  console.log(`  On-chain profile queried from contract ${CONTRACT_ADDRESS.slice(0, 10)}...`);
  console.log(`\n  Open http://localhost:3000 to see "${AGENT_NAME}" in the dashboard!\n`);
}

main().catch((err) => {
  console.error("\n❌ Fatal error:", err.message);
  process.exit(1);
});
