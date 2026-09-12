import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as wbn from 'wbn';
import * as wbnSign from 'wbn-sign';

const root = path.resolve(process.argv[2] || 'iwa-dist');
const output = path.resolve(process.argv[3] || 'signed.swbn');
const keyPath = process.env.IWA_PRIVATE_KEY_FILE;
if (!keyPath) throw new Error('IWA_PRIVATE_KEY_FILE is missing');

const key = wbnSign.parsePemKey(fs.readFileSync(keyPath, 'utf8'));
const origin = new wbnSign.WebBundleId(key).serializeWithIsolatedWebAppOrigin();
const primary = origin + 'index.html';
const manifestPath = path.join(root, '.well-known', 'manifest.webmanifest');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
manifest.version = process.env.IWA_VERSION || manifest.version;
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

const mime = {
  '.html':'text/html; charset=utf-8', '.htm':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8', '.json':'application/json', '.webmanifest':'application/manifest+json',
  '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp',
  '.gif':'image/gif', '.ico':'image/x-icon', '.woff':'font/woff', '.woff2':'font/woff2', '.mp3':'audio/mpeg',
  '.wav':'audio/wav', '.ogg':'audio/ogg', '.mp4':'video/mp4', '.webm':'video/webm', '.txt':'text/plain; charset=utf-8'
};

const csp = "base-uri 'none'; default-src 'self'; object-src 'none'; frame-src 'self' https: blob: data:; connect-src 'self' https: wss: blob: data:; script-src 'self' 'wasm-unsafe-eval'; img-src 'self' https: blob: data:; media-src 'self' https: blob: data:; font-src 'self' blob: data:; style-src 'self' 'unsafe-inline'; require-trusted-types-for 'script'; frame-ancestors 'self';";
const builder = new wbn.BundleBuilder('b2');
builder.setPrimaryURL(primary);
builder.setManifestURL(origin + '.well-known/manifest.webmanifest');

function walk(dir) {
  const out=[];
  for (const ent of fs.readdirSync(dir,{withFileTypes:true})) {
    const p=path.join(dir,ent.name);
    if (ent.isDirectory()) out.push(...walk(p)); else out.push(p);
  }
  return out;
}

for (const file of walk(root)) {
  const rel=path.relative(root,file).split(path.sep).join('/');
  const url=origin + rel;
  const ext=path.extname(file).toLowerCase();
  const headers={'Content-Type':mime[ext] || 'application/octet-stream'};
  if (ext === '.html') {
    headers['Cross-Origin-Embedder-Policy']='require-corp';
    headers['Cross-Origin-Opener-Policy']='same-origin';
    headers['Cross-Origin-Resource-Policy']='same-origin';
    headers['Content-Security-Policy']=csp;
  }
  builder.addExchange(url,200,headers,fs.readFileSync(file));
  if (rel === 'index.html') {
    builder.addExchange(origin,200,headers,fs.readFileSync(file));
  }
}

const unsigned = builder.createBundle();
const signed = await wbnSign.SignedWebBundle.fromWebBundle(unsigned,[new wbnSign.NodeCryptoSigningStrategy(key)]);
fs.writeFileSync(output,signed.getSignedWebBundleBytes());
console.log(`Web Bundle ID: ${signed.getWebBundleId()}`);
console.log(`Isolated Web App Origin: ${origin}`);
console.log(`Signed bundle: ${output}`);
