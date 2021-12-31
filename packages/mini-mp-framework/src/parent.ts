import { MessageType, Options } from "./type";

export default function parent(options:Options){
    let { workerPath, structure} = options
    let worker = new Worker(workerPath, { type: 'module' })
    worker.onmessage = (e)=>{
        if (e.data.type === MessageType.init){
            structure.render()
            worker.postMessage({
                type:MessageType.created
            })
        }else if(e.data.type === MessageType.update){
            for (const [key, value] of Object.entries(e.data.data)) {
                structure.data[key] = value
            }
            structure.render()
        }
    }
}