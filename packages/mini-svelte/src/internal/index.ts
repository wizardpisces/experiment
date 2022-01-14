// @ts-ignore
export { queueJob} from './scheduler.ts'
export {
    element,
    text,
    listen,
    insert,
    append,
    set_data
}
function element(tagName:string) {
    return document.createElement(tagName)
}
function text(txt: string) {
    return document.createTextNode(txt)
}
function listen(dom: Element, eventName: string, eHandler: EventListenerObject) {
    dom.addEventListener(eventName, eHandler)
}
function insert(parent:Element, child:Element, anchor:Element|null) {
    parent.insertBefore(child, anchor || null)
}
function append(parent:Element, child:Element) {
    parent.appendChild(child)
}
function set_data(dom:Element, txt:string) {
    dom.textContent = txt
}