import {element, text, listen, insert, append, set_data, create_component, mount_component, init, MiniSvelteComponent} from "@miniSvelte/internal/index.ts";
import Counter from "./lib/Counter.svelte";import Prop from "./lib/Prop.svelte";
function create_fragment(ctx) {
        let h1;
            let t0;
let t1;
let button;
            let t2;
let t3;
let t4;
let t5;
         let block = {
              c: function create() {
                  
                h1 = element("h1");
                t0 = text("Hello ");
t1 = text(ctx[0]);
                

                button = element("button");
                t2 = text("\n    ");
t3 = text(ctx[0]);
t4 = text(" Clicked ");
t5 = text(ctx[2]);
                
              },
              m: function mount(target,anchor){
                  
            insert(target,h1,anchor);
            append(h1,t0)
append(h1,t1)
            
            
        

            insert(target,button,anchor);
            append(button,t2)
append(button,t3)
append(button,t4)
append(button,t5)
            listen(button,"click",ctx[1]);/*click|inc*/
            
        
              },
              p: function patch(ctx,[dirty]){
               if(dirty === 0) set_data(t1,ctx[dirty]);
if(dirty === 0) set_data(t3,ctx[dirty]);
if(dirty === 2) set_data(t5,ctx[dirty]);
               

                console.log('dirty checked',ctx,dirty)
              }
        }
        return block
    }

    function instance($$invalidate,$$props,$$self){
        
        let name="parent";
function inc(){
                    $$invalidate(2,++count)
                }
let count=0;
        return [name,inc,count]
    }

    export default class AppMiniSvelte extends MiniSvelteComponent{
        constructor(options) {
            super()
            init(this, options,instance, create_fragment);
        }
    }