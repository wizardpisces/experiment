/**
 * deno run --allow-run ./subprocess.ts <somefile>
 * 
 * deno run --allow-run ./subprocess.ts curl.ts
 * 
 * 
 * By default when you use Deno.run() the subprocess inherits stdin,
 * stdout and stderr of the parent process. 
 * If you want to communicate with started subprocess you can use "piped" option.
 */
const fileNames = Deno.args;

const p = Deno.run({
    cmd: [
        "deno",
        "run",
        "--allow-read",
        "https://deno.land/std@0.95.0/examples/cat.ts",
        ...fileNames,
    ],
    stdout: "piped",
    stderr: "piped",
});

const { code } = await p.status();

// Reading the outputs closes their pipes
const rawOutput = await p.output();
const rawError = await p.stderrOutput();

if (code === 0) {
    await Deno.stdout.write(rawOutput);
} else {
    const errorString = new TextDecoder().decode(rawError);
    console.log(errorString);
}

Deno.exit(code);