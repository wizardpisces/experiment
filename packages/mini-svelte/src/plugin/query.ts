export function parseSvelteRequest(id: string): {
    filename: string
} {
    const [filename, rawQuery] = id.split(`?`, 2)
    return {
        filename
    }
}
