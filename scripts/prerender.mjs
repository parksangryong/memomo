import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const root=join(dirname(fileURLToPath(import.meta.url)),".."); const template=await readFile(join(root,"dist/index.html"),"utf8"); const {render}=await import(join(root,"dist-server/entry-server.js")); const routes=process.argv.slice(2).length?process.argv.slice(2):["/"];
for(const route of routes){const html=template.replace(/<div id="root">[\s\S]*?<\/div>/,`<div id="root">${render(route)}</div>`);const output=route==="/"?join(root,"dist/index.html"):join(root,"dist",route.slice(1),"index.html");await mkdir(dirname(output),{recursive:true});await writeFile(output,html)} await rm(join(root,"dist-server"),{recursive:true,force:true});
