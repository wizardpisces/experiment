export function outputB() {
    console.log("Module B's import.meta.url", import.meta.url);
    console.log("Module B's mainModule url", Deno.mainModule);
    console.log(
        "Is module B the main module via import.meta.main?",
        import.meta.main,
    );
}