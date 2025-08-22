// src/utils/typstPdf.ts
// Compile Typst to PDF 100% offline.
// npm i @myriaddreamin/typst.ts @myriaddreamin/typst-ts-web-compiler
// Put a mirror of `typst-assets/**/files/**` under: public/typst/assets/**

import { $typst } from '@myriaddreamin/typst.ts';
// Let Vite copy the WASM and give us a stable URL:
import wasmUrl from '@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm?url';

// CDN patterns Typst uses for assets (fonts/ICU). We’ll redirect to our mirror.
const CDN_PATTERNS: RegExp[] = [
  // typst’s official assets (you already had)
  /^https:\/\/cdn\.jsdelivr\.net\/gh\/typst\/typst-assets@[^/]+\/files\/(.+)$/,
  /^https:\/\/unpkg\.com\/@?typst\/assets@[^/]+\/files\/(.+)$/,

  // typst.ts asset hosts (fonts + icu packs)
  /^https:\/\/myriad-dreamin\.github\.io\/typst\.ts\/assets\/(.+)$/,
  /^https:\/\/cdn\.jsdelivr\.net\/gh\/Myriad-Dreamin\/typst\.ts@[^/]+\/assets\/(.+)$/,
  /^https:\/\/raw\.githubusercontent\.com\/Myriad-Dreamin\/typst\.ts\/gh-pages\/assets\/(.+)$/,
];
const LOCAL_ASSETS_BASE = '/typst/assets/';

let fetchPatched = false;

function installFetchRewriter(): void {
  if (fetchPatched) return;

  const DEBUG_ASSET_FETCH = true;

  // Dedup noisy logs
  const warnedUnmatched = new Set<string>();
  const warnedFailure = new Set<string>();

  const orig: typeof window.fetch = window.fetch.bind(window);

  // Helper: is this likely a Typst asset (fonts/ICU/etc.)?
  const looksLikeTypstAsset = (url: string) =>
    /\.(ttf|ttc|otf|woff2?|wasm|dat|json)$/i.test(url) ||
    /typst(\.ts)?\/assets|typst-assets/.test(url);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const urlStr =
      typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

    // Try to rewrite to local mirror
    for (const pat of CDN_PATTERNS) {
      const m = urlStr.match(pat);
      if (m) {
        const redirected = LOCAL_ASSETS_BASE + m[1]; // keep path under /files/ or /assets/
        const req = input instanceof Request ? new Request(redirected, input) : redirected;

        if (DEBUG_ASSET_FETCH) {
          // Only log first time for a given source→target pair
          const key = `${urlStr} → ${redirected}`;
          if (!warnedUnmatched.has(key)) {
            warnedUnmatched.add(key);
            console.debug('[typst-assets] redirect', key);
          }
        }

        const res = await orig(req as RequestInfo, init);
        if (DEBUG_ASSET_FETCH && !res.ok) {
          const key = `${redirected} [${res.status}]`;
          if (!warnedFailure.has(key)) {
            warnedFailure.add(key);
            console.warn('[typst-assets] redirected fetch failed', key);
          }
        }
        return res;
      }
    }

    // No redirect rule matched — flag probable asset URLs once
    if (DEBUG_ASSET_FETCH && looksLikeTypstAsset(urlStr)) {
      try {
        const u = new URL(urlStr);
        // Group by host + first 3 path segments so you don't get spammed
        const bucket = `${u.origin}/${u.pathname.split('/').slice(0, 3).join('/')}`;
        if (!warnedUnmatched.has(bucket)) {
          warnedUnmatched.add(bucket);
          console.warn(
            '[typst-assets] no redirect rule for',
            bucket,
            '→ mirror this under',
            LOCAL_ASSETS_BASE,
          );
        }
      } catch {
        // blob:, data:, etc. — ignore
      }
    }

    return orig(input as RequestInfo, init);
  };

  fetchPatched = true;
}

let inited = false;
//@eslint-disable-next-line
function ensureInit(): Promise<void> {
  if (inited) return new Promise((res) => res());
  // Force WASM from our own bundle (no network).
  $typst.setCompilerInitOptions({ getModule: () => wasmUrl });
  inited = true;
  return new Promise((res) => res());
}

/** Single entry point: Typst source → PDF bytes. */
export default async function compileTypstPdf(mainContent: string): Promise<Uint8Array> {
  installFetchRewriter();
  await ensureInit();

  const out = await $typst.pdf({ mainContent }); // typst returns Uint8Array (some d.ts mark it optional)
  if (!(out instanceof Uint8Array)) {
    throw new Error('typst: pdf() returned no bytes');
  }
  return out;
}
