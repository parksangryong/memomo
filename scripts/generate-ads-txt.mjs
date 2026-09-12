import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const client = process.env.VITE_ADSENSE_CLIENT || "";
const match = client.match(/^ca-pub-([0-9]{10,})$/);
if (match && !/^0+$/.test(match[1])) {
  await mkdir("dist", { recursive: true });
  await writeFile(join("dist", "ads.txt"), `google.com, pub-${match[1]}, DIRECT, f08c47fec0942fa0\n`);
  console.log("ads.txt generated");
} else {
  console.log("ads.txt skipped: set a real VITE_ADSENSE_CLIENT");
}

