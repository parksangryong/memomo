import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const template = await readFile(join(root, "dist/index.html"), "utf8");
const { render, SITE_URL, getPageMeta, getPrerenderPaths } = await import(join(root, "dist-server/entry-server.js"));
const routes = process.argv.slice(2).length ? process.argv.slice(2) : getPrerenderPaths();
const escape = (value) => value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
for (const route of routes) {
  const url = SITE_URL + (route === "/" ? "/" : route + "/");
  const meta = getPageMeta(route);
  let html = template
    .replace(/<div id="root">[\s\S]*?<\/div>/, () => '<div id="root" data-prerender-path="' + escape(route) + '">' + render(route) + "</div>")
    .replace(/<title>[\s\S]*?<\/title>/, () => "<title>" + escape(meta.title) + "</title>")
    .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, () => '<link rel="canonical" href="' + url + '" />')
    .replace(/<meta property="og:url" content="[^"]*"\s*\/>/, () => '<meta property="og:url" content="' + url + '" />');
  for (const name of ["description", "og:description"]) {
    html = html.replace(new RegExp('<meta\\s+(?:name|property)="' + name + '"\\s+content="[^"]*"\\s*/>'), () => '<meta ' + (name.includes(":") ? "property" : "name") + '="' + name + '" content="' + escape(meta.description) + '" />');
  }
  html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/>/, () => '<meta property="og:title" content="' + escape(meta.title) + '" />')
    .replace(/<meta property="og:image" content="\/([^"]*)"\s*\/>/, (_, image) => '<meta property="og:image" content="' + SITE_URL + "/" + image + '" />')
    .replace("</head>", () => '<meta name="twitter:title" content="' + escape(meta.title) + '" /><meta name="twitter:description" content="' + escape(meta.description) + '" /></head>');
  if (meta.noindex) html = html.replace(/<meta name="robots" content="[^"]*"\s*\/>/, '<meta name="robots" content="noindex,follow" />');
  const output = route === "/" ? join(root, "dist/index.html") : join(root, "dist", route.slice(1), "index.html");
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, html);
}
const indexed = routes.filter((route) => !getPageMeta(route).noindex);
await writeFile(join(root, "dist/sitemap.xml"), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + indexed.map((route) => "  <url><loc>" + SITE_URL + (route === "/" ? "/" : route + "/") + "</loc><changefreq>monthly</changefreq><priority>" + (route === "/" ? "1.0" : route.startsWith("/play/") ? "0.8" : "0.4") + "</priority></url>").join("\n") + "\n</urlset>\n");
await writeFile(join(root, "dist/robots.txt"), "User-agent: *\nAllow: /\n\nSitemap: " + SITE_URL + "/sitemap.xml\n");
await rm(join(root, "dist-server"), { recursive: true, force: true });
console.log("Prerendered " + routes.length + " pages.");
