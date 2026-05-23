import { readdir, readFile } from "fs/promises";
import { join } from "path";
const EXCLUDED_ADDRESSES = new Set([
    "0x1a6389aa779BD3C01B7867bB76a9B51f283f9B3a".toLowerCase(),
    "0x1D1fA7f6fB15cDc66165E8E221ec10429e7F4203".toLowerCase(),
    "0x0000000000000000000000000000000000000000".toLowerCase()
]);
async function scanDir(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === "node_modules" || entry.name === ".git" || entry.name === ".next" || entry.name === "dist") {
                continue;
            }
            await scanDir(fullPath);
        }
        else if (entry.isFile()) {
            const ext = entry.name.split(".").pop();
            if (ext === "json" || ext === "ts" || ext === "js" || ext === "md" || ext === "env" || ext === "txt" || ext === "log") {
                try {
                    const content = await readFile(fullPath, "utf-8");
                    const regex = /0x[a-fA-F0-9]{40}/g;
                    let match;
                    while ((match = regex.exec(content)) !== null) {
                        const address = match[0].toLowerCase();
                        if (!EXCLUDED_ADDRESSES.has(address)) {
                            console.log(`Found address: ${match[0]} in ${fullPath}`);
                        }
                    }
                }
                catch {
                    // ignore binary/read errors
                }
            }
        }
    }
}
async function run() {
    console.log("Scanning Megent-Agora-Orchestrator...");
    await scanDir("c:\\Users\\mikil\\Downloads\\Agent\\Megent-Agora-Orchestrator");
    console.log("\nScanning AgentCourt-Arc...");
    await scanDir("c:\\Users\\mikil\\Downloads\\Agent\\AgentCourt-Arc");
}
run();
