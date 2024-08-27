import { AuraRingFlags } from "./AuraRingFlags.js";

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

    // Handlers
    static async handleDestroyToken(simpleToken)
    {
        AuraRingCanvas.getCanvas(simpleToken)?.destroyPixiAuraContainer();
    }

    static async handleRefreshToken(simpleToken)
    {
        AuraRingCanvas.getCanvas(simpleToken)?.drawCanvas();
    }

    static async handleSightRefresh()
    {
        for (const simpleTokenDocument of game.scenes.current.tokens) {
            AuraRingCanvas.getCanvas(simpleTokenDocument.object)?.refreshSight();
        }
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
    }

    drawAuraRing(auraRing, closePath)
    {
        const canvas = game.canvas.dimensions;
        const originX = this.simpleToken.w / 2;
        const originY = this.simpleToken.h / 2;
        const auraRadius = (auraRing.radius * (canvas.size / canvas.distance)) + originX;

        auraRing.angle === 360
            ? this.drawCircularAuraRing(originX, originY, auraRadius)
            : this.drawAngledAuraRing(originX, originY, auraRadius, auraRing.angle, auraRing.direction, closePath);
    }

    drawAngledAuraRing(originX, originY, radius, angle, auraDirection, closePath)
    {
        const radiansPerDegree = Math.PI / 180;
        const startAngle = ((-90 + auraDirection + this.simpleToken.document.rotation) - (angle / 2)) * radiansPerDegree;
        const endAngle = startAngle + (angle * radiansPerDegree);
        const arcStartX = originX + radius * Math.cos(startAngle);
        const arcStartY = originY + radius * Math.sin(startAngle);
        
        this.pixiGraphics.startPoly();
        
        if (closePath === true) {
            this.pixiGraphics.moveTo(originX, originY);
            this.pixiGraphics.lineTo(arcStartX, arcStartY);
        }

        this.pixiGraphics.arc(originX, originY, radius, startAngle, endAngle);
        
        if (closePath === true) {
            this.pixiGraphics.lineTo(originX, originY);
            this.pixiGraphics.closePath();
        }

        this.pixiGraphics.finishPoly();
    }

    drawCircularAuraRing(originX, originY, radius)
    {
        this.pixiGraphics.drawCircle(originX, originY, radius);
    }

    shouldDraw()
    {
        if (this.simpleToken.document.hidden === true) {
            if (game.user.role !== CONST.USER_ROLES.GAMEMASTER) {
                return false;
            }
        }

        return AuraRingFlags.hasAuraRings(this.simpleToken.document) === true;
    }

    shouldRender(auraRing)
    {
        if (auraRing.radius < 1) {
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
}
