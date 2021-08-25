import { Container } from "../index";
import { TYPES } from "./types";
import { Warrior, Weapon, ThrowableWeapon, Run } from "./interfaces";
import { Ninja, Katana, Shuriken, FastRun } from "./entities";

const myContainer = new Container();
myContainer.bind<Warrior>(TYPES.Warrior).to(Ninja);
myContainer.bind<Weapon>(TYPES.Weapon).to(Katana);
myContainer.bind<ThrowableWeapon>(TYPES.ThrowableWeapon).to(Shuriken);

// bind self to self to support @inject() without params
myContainer.bind<Run>(FastRun).to(FastRun);
// console.log('myContainer', myContainer.bindMap)
export { myContainer };
