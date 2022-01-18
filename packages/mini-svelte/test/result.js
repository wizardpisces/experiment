import {element, text, listen, insert, append, set_data, create_component, mount_component, init, MiniSvelteComponent} from "@miniSvelte/internal/index.ts";

function create_fragment(ctx) {
        let p;
            let t0;
let t1;
         let block = {
              c: function create() {
                  
                p = element("p");
                t0 = text("Child: The prop is prop1:");
t1 = text(ctx[0]);
                
              },
              m: function mount(target,anchor){
                  
            insert(target,p,anchor);
            append(p,t0)
append(p,t1)
            
            
        
              },
              p: function patch(ctx,[dirty]){
               if(dirty & undefined) set_data(t0,ctx[dirty]);
if(dirty & 0) set_data(t1,ctx[dirty]);
               
                console.log('dirty checked',ctx,dirty)
              }
        }
        return block
    }

    function instance($$invalidate,$$props,$$self){
        
        let { prop1 }=$$props
        
         $$self.$set = $$props => {
             if('prop1' in $$props) $$invalidate(0,prop1 = $$props.prop1);
        };
        
        
        return [prop1]
    }

    export default class AppMiniSvelte extends MiniSvelteComponent{
        constructor(options) {
            super()
            init(this, options,instance, create_fragment);
        }
    }