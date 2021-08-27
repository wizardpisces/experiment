/**
 * How to run
 *  deno run https://deno.land/std@0.95.0/examples/curl.ts https://example.com
 * or
 *  deno run --allow-net=example.com curl.ts https://example.com
 */

const url = Deno.args[0];
const res = await fetch(url);

const body = new Uint8Array(await res.arrayBuffer());
await Deno.stdout.write(body);