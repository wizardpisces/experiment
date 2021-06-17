import './env'

const sheetsMap = new Map()

export function updateStyle(id: string, content: string) {
    let style = sheetsMap.get(id);
    if (!style) {
        style = document.createElement('style')
        style.setAttribute('type', 'text/css')
        style.innerHTML = content
        document.head.appendChild(style)
    }

    sheetsMap.set(id, style);
}