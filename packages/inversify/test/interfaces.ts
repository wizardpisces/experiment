export interface Warrior {
    fight(): string;
    sneak(): string;
    run():string;
}

export interface Weapon {
    hit(): string;
}

export interface ThrowableWeapon {
    throw(): string;
}
export interface Run {
    runaway(): string;
}