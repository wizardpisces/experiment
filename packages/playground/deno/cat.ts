/**
 * deno run --allow-read https://deno.land/std@0.95.0/examples/cat.ts /etc/passwd
 * or
 * deno run --allow-read cat.ts ~/.zshrc
 */
const filenames = Deno.args;
for (const filename of filenames) {
    const file = await Deno.open(filename);
    await Deno.copy(file, Deno.stdout);
    file.close();
}