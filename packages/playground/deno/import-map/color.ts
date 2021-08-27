/**
 * deno run --import-map=import_map.json color.ts
 */
import { red } from "fmt/colors.ts";

console.log(red("hello world"));