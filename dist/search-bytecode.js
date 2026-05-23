import { readdir, readFile } from "fs/promises";
import { join } from "path";
async function searchBytecode(dir) {
    try {
        const entries = await readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = join(dir, entry.name);
            if (entry.isDirectory()) {
                if (entry.name === "node_modules" || entry.name === ".git" || entry.name === ".next") {
                    continue;
                }
                await searchBytecode(fullPath);
            }
            else if (entry.isFile() && entry.name.endsWith(".json")) {
                try {
                    const content = await readFile(fullPath, "utf-8");
                    if (content.includes('"bytecode"') || content.includes('"object"')) {
                        console.log(`Found bytecode JSON: ${fullPath}`);
                    }
                }
                catch { }
            }
        }
    }
    catch { }
}
async function run() {
    await searchBytecode("c:\\Users\\mikil\\Downloads\\Agent");
}
run();
