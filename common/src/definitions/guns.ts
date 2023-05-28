import { type ItemDefinition } from "../utils/objectDefinitions";
import { v, type Vector } from "../utils/vector";

export interface GunDefinition extends ItemDefinition {
    readonly type: "gun"

    readonly cooldown: number
    readonly fireMode: "single" | "auto"
    readonly shotSpread: number
    readonly bulletCount?: number
    readonly fists: {
        readonly left: Vector
        readonly right: Vector
        readonly animationDuration: number
    }
    readonly image: {
        readonly position: Vector
        readonly angle?: number
    }
    readonly capacity: number
    readonly ballistics: {
        readonly damage: number
        readonly obstacleMultiplier: number
        readonly speed: number
        readonly speedVariance: number
        readonly maxDistance: number
    }
}

export const Guns: GunDefinition[] = [
    {
        idString: "ak47",
        name: "AK-47",
        type: "gun",
        cooldown: 100,
        fireMode: "auto",
        shotSpread: 4.5,
        fists: {
            left: v(65, 0),
            right: v(140, -10),
            animationDuration: 100
        },
        image: { position: v(120, 0) },
        capacity: Infinity,
        ballistics: {
            damage: 20.5,
            obstacleMultiplier: 2,
            speed: 0.715,
            speedVariance: 0,
            maxDistance: 300
        }
    },
    {
        idString: "m3k",
        name: "M3K",
        type: "gun",
        cooldown: 333.33,
        fireMode: "single",
        shotSpread: 9,
        bulletCount: 24,
        fists: {
            left: v(65, 0),
            right: v(130, -10),
            animationDuration: 100
        },
        image: { position: v(100, 0) },
        capacity: Infinity,
        ballistics: {
            damage: 0.66,
            obstacleMultiplier: 2,
            speed: 1.2,
            speedVariance: 0.1,
            maxDistance: 50
        }
    }
];
