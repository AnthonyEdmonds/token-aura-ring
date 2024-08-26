import { AuraRingFlags } from "./AuraRingFlags.js";

export class AuraRing
{
    static canvasKey = 'auraRing';

    pixiCanvas;

    pixiContainer;

    pixiGraphics;
    
    simpleToken;

    // Setup
    constructor(simpleToken)
    {
        this.pixiCanvas = this.findCanvas();
        this.pixiContainer = new PIXI.Container();
        this.pixiGraphics = new PIXI.Graphics();
        
        this.pixiCanvas.addChild(this.pixiContainer);
        this.pixiContainer.addChild(this.pixiGraphics);

        this.simpleToken = simpleToken;
    }

    static setup()
    {
        Hooks.off('initializeVisionSources', AuraRing.setup)
        
        const container = new PIXI.Container();
        container.name = 'tokenAuraRing';
        canvas.primary.addChild(container);
        
        Hooks.on('destroyToken', AuraRing.removeCanvas);
        Hooks.on('drawToken', AuraRing.drawCanvas);
        Hooks.on('refreshToken', AuraRing.refreshCanvas);
        Hooks.on('sightRefresh', AuraRing.refreshSight)
        Hooks.on('updateToken', AuraRing.updateCanvas);

        for (const token of game.scenes.current.tokens.contents) {
            AuraRing.drawCanvas(token.object);
        }

        return container;
    }

    // Canvas
    static clearCanvas(simpleToken)
    {
        if (AuraRing.hasCanvas(simpleToken) === true) {
            simpleToken[AuraRing.canvasKey].clear();
        }
    }

    static drawCanvas(simpleToken)
    {
        if (AuraRingFlags.hasAuraRings(simpleToken.document) !== true) {
            return;
        }

        if (AuraRing.hasCanvas(simpleToken) !== true) {
            simpleToken[AuraRing.canvasKey] = new AuraRing(simpleToken);
        }

        AuraRing.clearCanvas(simpleToken);

        if (simpleToken[AuraRing.canvasKey].shouldDraw() === true) {
            simpleToken[AuraRing.canvasKey].renderAll();
        }
    }

    static hasCanvas(simpleToken)
    {
        return simpleToken.hasOwnProperty(AuraRing.canvasKey) === true;
    }

    static refreshCanvas(simpleToken)
    {
        if (AuraRing.hasCanvas(simpleToken) === true) {
            simpleToken[AuraRing.canvasKey].move();
        }
    }

    static removeCanvas(simpleToken)
    {
        if (AuraRing.hasCanvas(simpleToken) === true) {
            simpleToken[AuraRing.canvasKey].destroy();
        }
    }

    static updateCanvas(simpleTokenDocument)
    {
        AuraRing.drawCanvas(simpleTokenDocument.object);
    }

    // Vision
    static refreshSight(event)
    {
        for (const simpleTokenDocument of game.scenes.current.tokens.contents) {
            if (AuraRing.hasCanvas(simpleTokenDocument.object) !== true) {
                return;
            }

            simpleTokenDocument.object[AuraRing.canvasKey].pixiGraphics.alpha = simpleTokenDocument.object.isVisible === true ? 1 : 0;
        }
    }

    // PIXI Graphics
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

        return AuraRing.setup(canvas.primary);
    }

    move()
    {
        this.pixiContainer.position.set(this.simpleToken.x, this.simpleToken.y);
    }

    renderAll()
    {
        const auraRings = AuraRingFlags.getAuraRings(this.simpleToken.document);

        this.move();

        for (const auraRing of auraRings) {
            if (this.shouldRender(auraRing) !== true) {
                continue;
            }

            this.render(auraRing);
        }
    }

    render(auraRing)
    {
        if (this.hasFill(auraRing) === true) {
            this.renderFill(auraRing);
        }

        if (this.hasStroke(auraRing) === true) {
            console.log('Has stroke');
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

        return true;
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
