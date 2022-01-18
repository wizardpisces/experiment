import { Descriptor, parseMain } from "../src/parse/index"
import fs from 'fs'
let code = `
<script>
	export let prop1;
</script>

<p>Child: The prop is prop1:{prop1}</p>
`

let descriptor = parseMain(code)

console.log(descriptor.script)
console.log(descriptor.style)
console.log(descriptor.template)
fs.writeFileSync(__dirname+'/result.js', descriptor.template,'utf8')
console.log('\ncompile success.....')