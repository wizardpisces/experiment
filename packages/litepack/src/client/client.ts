import './env'

const sheetsMap = new Map()

// @ts-ignore
export function updateStyle(id, content) {
    let style = sheetsMap.get(id);
    if (!style) {
        style = document.createElement('style')
        style.setAttribute('type', 'text/css')
        style.innerHTML = content
        document.head.appendChild(style)
    }

    sheetsMap.set(id, style);
}