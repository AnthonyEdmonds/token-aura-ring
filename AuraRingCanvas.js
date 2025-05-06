import { AuraRingActiveEffects } from "./AuraRingActiveEffects.js";
import { AuraRingFlags } from "./AuraRingFlags.js";
import { Euclidean } from "./Euclidean.js";
import { GridBased } from "./GridBased.js";

export class AuraRingCanvas
{
    static key = 'tokenAuraRing';
    
    pixiAurasContainer;
    
    pixiAuraContainer;
    
    pixiGraphics;
    
    token;
    
    // Setup
    constructor(token)
    {
        this.pixiAurasContainer = AuraRingCanvas.findPixiAurasContainer();
        this.pixiAuraContainer = new PIXI.Container();
        this.pixiGraphics = new PIXI.Graphics();
        
        this.pixiAurasContainer.addChild(this.pixiAuraContainer);
        this.pixiAuraContainer.addChild(this.pixiGraphics);
        
        this.token = token;
    }
    
    // Getters
    get isBeingPreviewed()
    {
        return typeof this.token._preview !== 'undefined';
    }
    
    // Handlers
    /**
     * Handle the "destroyToken" hook
     * @param {foundry.canvas.placeables.Token} token 
     */
    static async handleDestroyToken(token)
    {
        if (AuraRingCanvas.isClass(token, foundry.canvas.placeables.Token) === true) {
            AuraRingCanvas.getCanvas(token)?.destroyPixiAuraContainer();
        }
    }
    
    /**
     * Handle the "refreshToken" hook
     * @param {foundry.canvas.placeables.Token} token 
     */
    static async handleRefreshToken(token)
    {
        if (AuraRingCanvas.isClass(token, foundry.canvas.placeables.Token) === true) {
            AuraRingCanvas.getCanvas(token)?.drawCanvas();
        }
    }

    /**
     * Handle the "updateToken" hook
     * @param {TokenDocument} tokenDocument
     */
    static async handleUpdateToken(tokenDocument)
    {
        if (AuraRingCanvas.isClass(tokenDocument, TokenDocument) === true) {
            AuraRingCanvas.handleRefreshToken(tokenDocument.object);
        }
    }
    
    static isClass(object, type)
    {
        if (typeof object !== 'object') {
            return false;
        }

        return object instanceof type === true;
    }

    // Canvas
    static getCanvas(token)
    {
        if (AuraRingCanvas.hasCanvas(token) === true) {
            return token[AuraRingCanvas.key];
        }
        
        if (AuraRingCanvas.shouldHaveCanvas(token) === true) {
            return this.makeCanvas(token);
        }
        
        return null;
    }
    
    static hasCanvas(token)
    {
        return token.hasOwnProperty(AuraRingCanvas.key) === true;
    }
    
    static makeCanvas(token)
    {
        const auraRingCanvas = new AuraRingCanvas(token);
        token[AuraRingCanvas.key] = auraRingCanvas;
        
        return auraRingCanvas;
    }
    
    static shouldHaveCanvas(token)
    {
        return AuraRingFlags.hasAuraRings(token.document);
    }
    
    drawCanvas()
    {
        this.pixiGraphics.clear();
        
        if (this.shouldDraw() === true) {
            this.renderAuraRings();
        }
    }

    // PIXI Auras Container
    static findPixiAurasContainer()
    {
        for (const container of canvas.primary.children) {
            if (container.name === AuraRingCanvas.key) {
                return container;
            }
        }
        
        return AuraRingCanvas.makePixiAurasContainer();
    }
    
    static makePixiAurasContainer()
    {
        const container = new PIXI.Container();
        container.name = AuraRingCanvas.key;
        container.sortLayer = 600;
        canvas.primary.addChild(container);

        return container;
    }
    
    // PIXI Aura Container
    destroyPixiAuraContainer()
    {
        this.pixiAurasContainer.removeChild(this.pixiAuraContainer);
        this.pixiAuraContainer.removeChild(this.pixiGraphics);
        
        this.pixiGraphics.destroy();
        this.pixiAuraContainer.destroy();
        
        delete this.token[AuraRingCanvas.key];
    }
    
    movePixiAuraContainer()
    {
        this.pixiAuraContainer.position.set(this.token.x, this.token.y);
    }
    
    // PIXI Graphics
    renderAuraRings()
    {
        const auraRings = AuraRingFlags.getAuraRings(this.token.document);
        const effectsIndex = AuraRingActiveEffects.index(this.token.document);
        
        this.movePixiAuraContainer();
        
        for (let auraRing of auraRings) {
            auraRing = AuraRingActiveEffects.apply(auraRing, effectsIndex);

            if (this.shouldRender(auraRing) !== true) {
                continue;
            }
            
            this.renderAuraRing(auraRing);
        }
    }
    
    renderAuraRing(auraRing)
    {
        if (this.hasFill(auraRing) === true) {
            this.renderFill(auraRing);
        }
        
        if (this.hasStroke(auraRing) === true) {
            this.renderStroke(auraRing);
        }
    }
    
    renderFill(auraRing)
    {
        this.pixiGraphics.beginFill(
            auraRing.fill_colour,
            this.auraOpacity(auraRing.fill_opacity),
        );
        
        this.drawAuraRing(auraRing, true);
        this.pixiGraphics.endFill();
    }
    
    renderStroke(auraRing)
    {
        this.pixiGraphics.lineStyle(
            auraRing.stroke_weight,
            auraRing.stroke_colour,
            this.auraOpacity(auraRing.stroke_opacity),
            0,
        );
        
        this.drawAuraRing(auraRing, auraRing.stroke_close);
        
        this.pixiGraphics.lineStyle(0, '#000000', 0, 0);
    }
    
    drawAuraRing(auraRing, close)
    {
        this.pixiGraphics.startPoly();

        this.useGridShapes(auraRing) === true
            ? GridBased.draw(
                this.pixiGraphics,
                auraRing, 
                this.token.document,
            )
            : Euclidean.draw(
                this.pixiGraphics,
                auraRing,
                this.token.document,
                close,
            );

        this.pixiGraphics.finishPoly();
    }

    shouldDraw()
    {
        if (this.isBeingPreviewed === true) {
            return false;
        }
        
        if (this.token.document.hidden === true) {
            if (game.user.role !== CONST.USER_ROLES.GAMEMASTER) {
                return false;
            }
        }
        
        return AuraRingFlags.hasAuraRings(this.token.document) === true;
    }
    
    shouldRender(auraRing)
    {
        if (auraRing.hide === true) {
            return false;
        }

        if (auraRing.radius === 0) {
            return false;
        }
        
        if (auraRing.visibility === 'NONE') {
            return false;
        }
        
        if (
            this.hasStroke(auraRing) === false 
            && this.hasFill(auraRing) === false
        ) {
            return false;
        }
        
        if (game.user.hasRole(auraRing.visibility) !== true) {
            return false;
        }

        if (
            auraRing.hover_only === true
            && this.token.hover !== true
        ) {
            return false;
        }

        if (
            auraRing.owner_only === true
            && this.token.observer !== true
        ) {
            return false;
        }

        if (
            auraRing.respect_fog === true
            && this.token.isVisible === false
        ) {
            return false;
        }
        
        return true;
    }
    
    // Aura Rings
    auraOpacity(opacity)
    {
        return this.token.document.hidden === true
            ? opacity / 2
            : opacity;
    }
    
    hasFill(auraRing)
    {
        return auraRing.fill_opacity > 0;
    }
    
    hasStroke(auraRing)
    {
        return auraRing.stroke_opacity > 0 && auraRing.stroke_weight > 0;
    }

    useGridShapes(auraRing)
    {
        return auraRing.use_grid_shapes === true
            && game.settings.get('core', 'gridTemplates') === true;
    }
}
