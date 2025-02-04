import Phaser from "phaser";

import core from "../core";
import { type Game } from "../game";
import { type MenuScene } from "./menuScene";

import { InputPacket } from "../packets/sending/inputPacket";
import { JoinPacket } from "../packets/sending/joinPacket";
import { Player } from "../objects/player";

import { Materials } from "../../../../common/src/definitions/obstacles";
import { localStorageInstance } from "../utils/localStorageHandler";
import { ObjectType } from "../../../../common/src/utils/objectType";
import { ObjectCategory } from "../../../../common/src/constants";
import { Guns } from "../../../../common/src/definitions/guns";
import { setupInputs } from "../utils/inputManager";

export class GameScene extends Phaser.Scene {
    activeGame!: Game;
    sounds: Map<string, Phaser.Sound.BaseSound> = new Map<string, Phaser.Sound.BaseSound>();
    soundsToLoad: Set<string> = new Set<string>();
    volume = localStorageInstance.config.sfxVolume * localStorageInstance.config.masterVolume;

    constructor() {
        super("game");
    }

    // noinspection JSUnusedGlobalSymbols
    preload(): void {
        if (core.game === undefined) return;
        this.activeGame = core.game;

        this.load.atlas("main", "/img/atlases/main.png", "/img/atlases/main.json");

        for (const material of Materials) {
            this.loadSound(`${material}_hit_1`, `sfx/hits/${material}_hit_1`);
            this.loadSound(`${material}_hit_2`, `sfx/hits/${material}_hit_2`);
            this.loadSound(`${material}_destroyed`, `sfx/hits/${material}_destroyed`);
        }

        for (const gun of Guns) {
            this.loadSound(`${gun.idString}_fire`, `sfx/weapons/${gun.idString}_fire`);
            this.loadSound(`${gun.idString}_switch`, `sfx/weapons/${gun.idString}_switch`);
        }

        this.loadSound("player_hit_1", "sfx/hits/player_hit_1");
        this.loadSound("player_hit_2", "sfx/hits/player_hit_2");

        this.loadSound("health_explosion", "sfx/health_explosion");

        this.loadSound("swing", "sfx/swing");
        this.loadSound("grass_step_01", "sfx/footsteps/grass_01");
        this.loadSound("grass_step_02", "sfx/footsteps/grass_02");

        this.cameras.main.setZoom(this.sys.game.canvas.width / 2560);
    }

    private loadSound(name: string, path: string): void {
        try {
            this.load.audio(name, require(`../../assets/audio/${path}.mp3`));
            this.soundsToLoad.add(name);
        } catch (e) {
            console.warn(`Failed to load sound: ${name}`);
            console.error(e);
        }
    }

    get player(): Player {
        return this.activeGame.activePlayer;
    }

    create(): void {
        (this.scene.get("menu") as MenuScene).stopMusic();

        for (const sound of this.soundsToLoad) {
            this.sounds.set(sound, this.sound.add(sound));
        }

        $("#game-ui").show();

        // Draw the grid
        const GRID_WIDTH = 7200;
        const GRID_HEIGHT = 7200;
        const CELL_SIZE = 160;

        for (let x = 0; x <= GRID_WIDTH; x += CELL_SIZE) {
            this.add.line(x, 0, x, 0, x, GRID_HEIGHT * 2, 0x000000, 0.25).setOrigin(0, 0);
        }
        for (let y = 0; y <= GRID_HEIGHT; y += CELL_SIZE) {
            this.add.line(0, y, 0, y, GRID_WIDTH * 2, y, 0x000000, 0.25).setOrigin(0, 0);
        }

        // Create the player
        // TODO fix this, lol
        // > undefined as unknown as number
        this.activeGame.activePlayer = new Player(this.activeGame, this, ObjectType.categoryOnly(ObjectCategory.Player), undefined as unknown as number);
        this.activeGame.activePlayer.name = $("#username-input").text();
        setupInputs(this);

        // Follow the player w/ the camera
        this.cameras.main.startFollow(this.player.images.container);

        // Start the tick loop
        this.tick();

        // Send a packet indicating that the game is now active
        this.activeGame.sendPacket(new JoinPacket(this.player));

        // Initializes sounds
        [
            "swing",
            "grass_step_01",
            "grass_step_02"
        ].forEach(item => this.sounds.set(item, this.sound.add(item, { volume: this.volume })));
    }

    playSound(name: string): void {
        const sound: Phaser.Sound.BaseSound | undefined = this.sounds.get(name);
        if (sound === undefined) {
            console.warn(`Unknown sound: "${name}"`);
            return;
        }
        sound.play({ volume: this.volume });
    }

    tick(): void {
        if (this.player?.dirty.inputs) {
            this.player.dirty.inputs = false;
            this.activeGame.sendPacket(new InputPacket(this.player));
        }

        setTimeout(this.tick.bind(this), 30);
    }
}
