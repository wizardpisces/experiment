import { MessageType, Options } from "./type";

export default function worker(options: Options) {
    let { structure } = options
    let scope = {
        setData(data: any) {
            postMessage({
                type: MessageType.update,
                data
            })
        }
    }
    postMessage({
        type: MessageType.init
    })
    onmessage = (e) => {
        if (e.data.type === MessageType.created) {
            structure.created.call(scope)
        }
    }
}