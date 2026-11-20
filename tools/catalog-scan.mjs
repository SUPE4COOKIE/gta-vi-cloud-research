#!/usr/bin/env node
/**
 * Scan an Xbox Cloud Gaming catalogue for titles with device allowlists.
 *
 * Read-only. Prints catalogue metadata only; never prints the bearer token.
 *
 * Usage:
 *   GSSV_TOKEN="<token>" GSSV_BASE="https://<region>.gssv-play-prod.xboxlive.com" \
 *     node catalog-scan.mjs
 *
 * Requirements:
 *   Node 20+ (global fetch).
 *
 * Notes:
 *   - The token is a GSSV `gsToken` obtained through normal authentication.
 *   - This script performs no authentication and stores nothing.
 *   - Keep page sizes modest; the service paginates at mr<=200.
 */

const TOKEN = process.env.GSSV_TOKEN;
const BASE = process.env.GSSV_BASE;
const CLIENT = process.env.GSSV_CLIENT ?? 'XboxComBrowser';
const UA =
  process.env.GSSV_UA ??
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

if (!TOKEN || !BASE) {
  console.error('Set GSSV_TOKEN and GSSV_BASE. See the header of this file.');
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function page(continuation) {
  const url = new URL('/v2/titles', BASE);
  url.searchParams.set('mr', '200');
  if (continuation) url.searchParams.set('ct', continuation);

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'x-gssv-client': CLIENT,
      'User-Agent': UA,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`catalogue request failed: HTTP ${res.status}`);
  }
  return res.json();
}

const restricted = [];
let total = 0;
let continuation = '';
let pages = 0;

do {
  const data = await page(continuation);
  for (const title of data.results ?? []) {
    total += 1;
    const details = title.details ?? {};
    const devices = details.allowedDeviceTypes ?? [];
    if (devices.length > 0) {
      restricted.push({
        titleId: title.titleId,
        productId: details.productId,
        devices,
        entitled: details.hasEntitlement === true,
        maxSessionSeconds: details.maxSessionLengthInSeconds ?? null,
      });
    }
  }
  continuation = data.continuationToken ?? '';
  pages += 1;
  if (continuation) await sleep(350);
} while (continuation && pages < 40);

console.log(`titles scanned: ${total}`);
console.log(`pages: ${pages}`);
console.log(`restricted titles: ${restricted.length}`);
for (const row of restricted) {
  console.log(
    `  ${row.titleId}  devices=[${row.devices.join(',')}]  entitled=${row.entitled}  maxSession=${row.maxSessionSeconds}`
  );
}
