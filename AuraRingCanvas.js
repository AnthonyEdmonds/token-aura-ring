import { AuraRingFlags } from "./AuraRingFlags.js";
import { Euclidean } from "./Euclidean.js";
import { GridBased } from "./GridBased.js";

export class AuraRingCanvas
{
    static key = 'tokenAuraRing';
    
    pixiAurasContainer;
    
    pixiAuraContainer;
    
    pixiGraphics;
    
    simpleToken;
    
    // Setup
    constructor(simpleToken)
    {
        this.pixiAurasContainer = AuraRingCanvas.findPixiAurasContainer();
        this.pixiAuraContainer = new PIXI.Container();
        this.pixiGraphics = new PIXI.Graphics();
        
        this.pixiAurasContainer.addChild(this.pixiAuraContainer);
        this.pixiAuraContainer.addChild(this.pixiGraphics);
        
        this.simpleToken = simpleToken;
    }
    
    // Getters
    get isBeingPreviewed()
    {
        return typeof this.simpleToken._preview !== 'undefined';
    }
    
    // Handlers
    static async handleDestroyToken(simpleToken)
    {
        if (AuraRingCanvas.isClass(simpleToken, Token) === true) {
            AuraRingCanvas.getCanvas(simpleToken)?.destroyPixiAuraContainer();
        }
    }
    
    static async handleRefreshToken(simpleToken)
    {
        if (AuraRingCanvas.isClass(simpleToken, Token) === true) {
            AuraRingCanvas.getCanvas(simpleToken)?.drawCanvas();
        }
    }
    
    static async handleSightRefresh()
    {
        for (const simpleTokenDocument of game.scenes.current.tokens) {
            AuraRingCanvas.getCanvas(simpleTokenDocument.object)?.refreshSight();
        }
    }
    
    static async handleUpdateToken(simpleTokenDocument)
    {
        if (AuraRingCanvas.isClass(simpleTokenDocument, TokenDocument) === true) {
            AuraRingCanvas.handleRefreshToken(simpleTokenDocument.object);
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
    static getCanvas(simpleToken)
    {
        if (AuraRingCanvas.hasCanvas(simpleToken) === true) {
            return simpleToken[AuraRingCanvas.key];
        }
        
        if (AuraRingCanvas.shouldHaveCanvas(simpleToken) === true) {
            return this.makeCanvas(simpleToken);
        }
        
        return null;
    }
    
    static hasCanvas(simpleToken)
    {
        return simpleToken.hasOwnProperty(AuraRingCanvas.key) === true;
    }
    
    static makeCanvas(simpleToken)
    {
        const auraRingCanvas = new AuraRingCanvas(simpleToken);
        simpleToken[AuraRingCanvas.key] = auraRingCanvas;
        
        return auraRingCanvas;
    }
    
    static shouldHaveCanvas(simpleToken)
    {
        return AuraRingFlags.hasAuraRings(simpleToken.document);
    }
    
    drawCanvas()
    {
        this.pixiGraphics.clear();
        
        if (this.shouldDraw() === true) {
            this.renderAuraRings();
        }
    }
    
    refreshSight()
    {
        this.pixiGraphics.alpha = this.simpleToken.isVisible === true ? 1 : 0;
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
        
        delete this.simpleToken[AuraRingCanvas.key];
    }
    
    movePixiAuraContainer()
    {
        this.pixiAuraContainer.position.set(this.simpleToken.x, this.simpleToken.y);
    }
    
    // PIXI Graphics
    renderAuraRings()
    {
        const auraRings = AuraRingFlags.getAuraRings(this.simpleToken.document);
        
        this.movePixiAuraContainer();
        
        for (const auraRing of auraRings) {
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
                this.simpleToken.document,
            )
            : Euclidean.draw(
                this.pixiGraphics,
                auraRing,
                this.simpleToken.document,
                close,
            );

        this.pixiGraphics.finishPoly();
    }

    shouldDraw()
    {
        if (this.isBeingPreviewed === true) {
            return false;
        }
        
        if (this.simpleToken.document.hidden === true) {
            if (game.user.role !== CONST.USER_ROLES.GAMEMASTER) {
                return false;
            }
        }
        
        return AuraRingFlags.hasAuraRings(this.simpleToken.document) === true;
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
        
        return true;
    }
    
    // Aura Rings
    auraOpacity(opacity)
    {
        return this.simpleToken.document.hidden === true
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
