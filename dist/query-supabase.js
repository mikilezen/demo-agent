async function querySupabase() {
    const supabaseUrl = "https://uhrdyewfmutketkopjho.supabase.co";
    const supabaseKey = "sb_publishable_DFpEjKpXxga18F0M-xuVZA_dgf3qxvA";
    console.log("Querying Supabase database...");
    // Since Supabase REST API is just Postgrest, we can query it directly via fetch!
    // Table: agentcourt_demo_state
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/agentcourt_demo_state?select=*`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });
        if (response.ok) {
            const data = await response.json();
            console.log("\n--- agentcourt_demo_state ---");
            console.log(JSON.stringify(data, null, 2));
        }
        else {
            console.log(`Failed to fetch state: ${response.status} ${response.statusText}`);
        }
    }
    catch (err) {
        console.error("Error fetching state:", err.message);
    }
    // Table: agentcourt_demo_agents
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/agentcourt_demo_agents?select=*`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });
        if (response.ok) {
            const data = await response.json();
            console.log("\n--- agentcourt_demo_agents ---");
            console.log(JSON.stringify(data, null, 2));
        }
        else {
            console.log(`Failed to fetch agents: ${response.status} ${response.statusText}`);
        }
    }
    catch (err) {
        console.error("Error fetching agents:", err.message);
    }
}
querySupabase();
export {};
