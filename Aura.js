import { Config } from "./Config.js";

export class Aura
{
    pixiCanvas;
    pixiContainer;
    pixiGraphics;
    simpleToken;

    static namespace = 'token-aura-ring';

    static key = 'auraRing';

    static draw(simpleToken)
    {
        if (Aura.hasFlags(simpleToken.document) !== true) {
            return;
        }

        if (Aura.hasAura(simpleToken) !== true) {
            simpleToken[Aura.key] = new Aura(simpleToken);
        }

        simpleToken[Aura.key].clear();

        if (simpleToken[Aura.key].shouldDraw() === true) {
            simpleToken[Aura.key].renderAll();
        }
    }

    static defaultSettings(name)
    {
        return {
            colour: '#000000',
            delete: 'no',
            name: name,
            opacity: 0.5,
            radius: 0,
            visibility: 'PLAYER',
            weight: 4,
        }
    }

    static hasAura(simpleToken)
    {
        return simpleToken.hasOwnProperty(Aura.key) === true;
    }

    static hasFlags(simpleTokenDocument)
    {
        return simpleTokenDocument.flags.hasOwnProperty(Aura.namespace) === true;
    }

    static migrateSettings(simpleTokenDocument)
    {
        if (Aura.hasFlags(simpleTokenDocument) !== true) {
            return;
        }

        const auras = simpleTokenDocument.flags[Aura.namespace];
        
        for (const key in auras) {
            const aura = auras[key];
            const defaultSettings = Aura.defaultSettings(key);

            for (const setting in defaultSettings) {
                if (aura.hasOwnProperty(setting) === false) {
                    aura[setting] = defaultSettings[setting];
                }
            }

            simpleTokenDocument.setFlag(Aura.namespace, key, aura);
        }
    }

    static refreshSight(event)
    {
        for (const simpleTokenDocument of game.scenes.current.tokens.contents) {
            if (Aura.hasAura(simpleTokenDocument.object) !== true) {
                return;
            }

            simpleTokenDocument.object[Aura.key].pixiGraphics.alpha = simpleTokenDocument.object.isVisible === true ? 1 : 0;
        }
    }

    static refreshToken(simpleToken)
    {
        if (simpleToken.hasOwnProperty(Aura.key) !== true) {
            return;
        }

        simpleToken[Aura.key].move();
    }

    static remove(simpleToken)
    {
        if (simpleToken.hasOwnProperty(Aura.key) !== true) {
            return;
        }

        simpleToken[Aura.key].destroy();
    }

    static setup()
    {
        Hooks.off('initializeVisionSources', Aura.setup)
        
        const container = new PIXI.Container();
        container.name = 'tokenAuraRing';
        canvas.primary.addChild(container);
        
        Hooks.on('destroyToken', Aura.remove);
        Hooks.on('drawToken', Aura.draw);
        Hooks.on('refreshToken', Aura.refreshToken);
        Hooks.on('sightRefresh', Aura.refreshSight)
        Hooks.on('updateToken', Aura.update);

        for (const token of game.scenes.current.tokens.contents) {
            Aura.migrateSettings(token.object.document);
            Aura.draw(token.object);
        }

        return container;
    }

    static update(simpleTokenDocument, changes)
    {
        if (
            changes.hasOwnProperty('flags') === true
            && changes.flags.hasOwnProperty(Aura.namespace) === true
        ) {
            Config.processChanges(simpleTokenDocument, changes.flags[Aura.namespace]);
        }

        Aura.draw(simpleTokenDocument.object);
    }

    constructor(simpleToken)
    {
        this.pixiCanvas = this.findCanvas();
        this.pixiContainer = new PIXI.Container();
        this.pixiGraphics = new PIXI.Graphics();
        
        this.pixiCanvas.addChild(this.pixiContainer);
        this.pixiContainer.addChild(this.pixiGraphics);

        this.simpleToken = simpleToken;
    }

    clear()
    {
        this.pixiGraphics.clear();
    }

    destroy()
    {
        this.pixiCanvas.removeChild(this.pixiContainer);
        this.pixiContainer.removeChild(this.pixiGraphics);

        this.pixiGraphics.destroy();
        this.pixiContainer.destroy();

        delete this.simpleToken.auraRing;
    }

    findCanvas()
    {
        for (const container of canvas.primary.children) {
            if (container.name === 'tokenAuraRing') {
                return container;
            }
        }

        return Aura.setup(canvas.primary);
    }

    getAuras()
    {
        return this.simpleToken.document.flags[Aura.namespace];
    }

    move()
    {
        this.pixiContainer.position.set(this.simpleToken.x, this.simpleToken.y);
    }

    renderAll()
    {
        const auras = this.getAuras();
        const canvas = game.canvas.dimensions;

        this.move();

        for (const name in auras) {
            if (this.shouldRender(auras[name]) !== true) {
                continue;
            }

            this.render(auras[name], canvas);
        }
    }

    render(aura, canvas)
    {
        const auraX = this.simpleToken.w / 2;
        const auraY = this.simpleToken.h / 2;
        const auraRadius = (aura.radius * (canvas.size / canvas.distance)) + auraX;
        let auraOpacity = aura.opacity;

        if (this.simpleToken.document.hidden === true) {
            if (auraOpacity > 0.25) {
                auraOpacity = 0.25;
            }
        }
        
        this.pixiGraphics
            .lineStyle(aura.weight, aura.colour, auraOpacity, 0)
            .drawCircle(auraX, auraY, auraRadius);
    }

    shouldDraw()
    {
        if (this.simpleToken.document.hidden === true) {
            if (game.user.role !== CONST.USER_ROLES.GAMEMASTER) {
                return false;
            }
        }

        return true;
    }

    shouldRender(flags)
    {
        if (flags.radius < 1) {
            return false;
        }

        if (flags.visibility === 'NONE') {
            return false;
        }

        if (game.user.hasRole(flags.visibility) !== true) {
            return false;
        }

        return true;
    }
}
