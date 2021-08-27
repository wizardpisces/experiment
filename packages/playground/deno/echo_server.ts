/**
 * deno run --allow-net https://deno.land/std@0.95.0/examples/echo_server.ts
 * or
 * deno run --allow-net echo_server.ts
 * 
 * nc localhost 8080
 */
const hostname = "0.0.0.0";
const port = 8080;
const listener = Deno.listen({ hostname, port });
console.log(`Listening on ${hostname}:${port}`);
for await (const conn of listener) {
    console.log(conn)
    Deno.copy(conn, conn);
}