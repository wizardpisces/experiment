import { myContainer } from "./inversify.config";
import { TYPES } from "./types";
import { Warrior } from "./interfaces";

const ninja = myContainer.get<Warrior>(TYPES.Warrior);

expect(ninja.fight()).eql("cut!"); // true
expect(ninja.sneak()).eql("hit!"); // true

function expect(input:any){
    return {
        eql(val:any){
            console.log(`expect ${input} eql to ${val} :`, input === val)
        }
    }
}