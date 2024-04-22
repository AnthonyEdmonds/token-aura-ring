export class Aura
{
    pixiCanvas;
    pixiContainer;
    pixiGraphics;
    simpleToken;

    static flagsNamespace = 'token-aura-ring';

    static flagsKey = 'aura';

    static key = 'auraRing';

    static add(simpleToken)
    {
        simpleToken[Aura.key] = new Aura(simpleToken);
    }

    static draw(simpleToken)
    {
        if (Aura.hasFlags(simpleToken.document) !== true) {
            return;
        }

        if (Aura.hasAura(simpleToken) !== true) {
            Aura.add(simpleToken);
        }

        simpleToken.auraRing.render();
    }

    static flags()
    {
        return {
            colour: '#000000',
            opacity: 0.5,
            radius: 0,
            weight: 4,
        }
    }

    static hasAura(simpleToken)
    {
        return simpleToken.hasOwnProperty(Aura.key) === true;
    }

    static hasFlags(simpleTokenDocument)
    {
        if (simpleTokenDocument.flags.hasOwnProperty(Aura.flagsNamespace) !== true) {
            return false;
        }

        return simpleTokenDocument.flags[Aura.flagsNamespace].hasOwnProperty(Aura.flagsKey) === true;
    }

    static refresh(simpleToken)
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
        
        let container = new PIXI.Container();
        container.name = 'tokenAuraRing';
        canvas.primary.addChild(container);
        
        Hooks.on('destroyToken', Aura.remove);
        Hooks.on('drawToken', Aura.draw);
        Hooks.on('refreshToken', Aura.refresh);
        Hooks.on('updateToken', Aura.update);

        for (let token of game.scenes.current.tokens.contents) {
            Aura.draw(token.object);
        }

        return container;
    }

    static update(simpleTokenDocument)
    {
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
        for (let container of canvas.primary.children) {
            if (container.name === 'tokenAuraRing') {
                return container;
            }
        }

        return Aura.setup(canvas.primary);
    }

    getFlags()
    {
        return this.simpleToken.document.getFlag(Aura.flagsNamespace, Aura.flagsKey);
    }
    
    move()
    {
        this.pixiContainer.position.set(this.simpleToken.x, this.simpleToken.y);
    }

    render()
    {
        let flags = this.getFlags();
        this.pixiGraphics.clear();

        if (this.shouldDraw(flags) !== true) {
            return;
        }

        this.move();

        let canvas = game.canvas.dimensions;
        let auraX = this.simpleToken.w / 2;
        let auraY = this.simpleToken.h / 2;
        let auraRadius = (flags.radius * (canvas.size / canvas.distance)) + auraX;

        this.pixiGraphics
            .lineStyle(flags.weight, flags.colour, flags.opacity, 0)
            .drawCircle(auraX, auraY, auraRadius);
    }

    shouldDraw(flags)
    {
        // TODO GM Permissions

        if (this.simpleToken.document.hidden === true) {
            return false;
        }

        if (flags.radius < 1) {
            return false;
        }
        
        if (this.simpleToken.isVisible !== true) {
            return false;
        }

        return flags.radius > 0;
    }
}
