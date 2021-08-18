
import { injectable, inject } from "../index";
import { Weapon, ThrowableWeapon, Warrior } from "./interfaces";
import { TYPES } from "./types";

// 武士刀
@injectable()
class Katana implements Weapon {
    public hit() {
        return "cut!";
    }
}

// 手里剑
@injectable()
class Shuriken implements ThrowableWeapon {
    public throw() {
        return "hit!";
    }
}

// @injectable()
// class Ninja implements Warrior {

//     private _katana: Weapon;
//     private _shuriken: ThrowableWeapon;

//     public constructor(
//         @inject(TYPES.Weapon) katana: Weapon,
//         @inject(TYPES.ThrowableWeapon) shuriken: ThrowableWeapon
//     ) {
//         this._katana = katana;
//         this._shuriken = shuriken;
//     }

//     public fight() { return this._katana.hit(); }
//     public sneak() { return this._shuriken.throw(); }

// }

// If you prefer it you can use property injection instead of constructor injection so you don't have to declare the class constructor:

@injectable()
class Ninja implements Warrior {
    // @ts-ignore
    @inject(TYPES.Weapon) private _katana: Weapon;
    // @ts-ignore
    @inject(TYPES.ThrowableWeapon) private _shuriken: ThrowableWeapon;
    public fight() { return this._katana.hit(); }
    public sneak() { return this._shuriken.throw(); }
}

export { Ninja, Katana, Shuriken };