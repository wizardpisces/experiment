import { myContainer } from "./inversify.config";
import { TYPES } from "./types";
import { Warrior } from "./interfaces";
import {expect} from './util'

const ninja = myContainer.get<Warrior>(TYPES.Warrior);
console.log('ninja',ninja,ninja.constructor)
expect(ninja.fight()).eql("hit!"); // true
expect(ninja.sneak()).eql("throw!"); // true
expect(ninja.run()).eql("run fast!"); // true
