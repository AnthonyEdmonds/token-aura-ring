import { Euclidean } from "./Euclidean.js";
import { Point } from "./Point.js";

export class Square
{
    /**
     * Draw a square Aura Ring
     * @param {PIXI.Graphics} canvas 
     * @param {AuraRing} auraRing 
     * @param {TokenDocument} tokenDocument 
     * @param {boolean} close 
     */
    static draw(canvas, auraRing, tokenDocument, close)
    {
        const origin = new Point(
            tokenDocument.object.w / 2,
            tokenDocument.object.h / 2,
        );

        const radius = Euclidean.pixelRadius(auraRing.radius, origin);

        auraRing.angle === 360
            ? Square.complete(canvas, auraRing, tokenDocument)
            : Square.cone(canvas, auraRing, origin, radius, tokenDocument.rotation, close);
    }

    /**
     * Create a square Aura Ring
     * @param {PIXI.Graphics} canvas
     * @param {AuraRing} auraRing
     * @param {TokenDocument} tokenDocument
     */
    static complete(canvas, auraRing, tokenDocument)
    {
        const gridSize = game.canvas.grid.size;
        const tokenHeight = gridSize * tokenDocument.height;
        const tokenWidth = gridSize * tokenDocument.width;
        const radius = Euclidean.pixelRadius(auraRing.radius, new Point());

        // TODO Pivot must be moved prior to drawing, will impact Aura Rings generally, but will remove token offset issue
        // TODO Pivot seems to always snap to top-left of token. Move origin to centre of token, then adjust position by same amount.

        // TODO Canvas positoin and pivot are permanent, and do not need to be reapplied

        canvas.position.x = tokenWidth / 2;
        canvas.position.y = tokenHeight / 2;

        canvas.pivot.x = tokenWidth / 2;
        canvas.pivot.y = tokenHeight / 2;

        canvas.drawCircle(
            canvas.pivot.x,
            canvas.pivot.y,
            5
        );

        canvas.drawRect(
            -radius,
            -radius,
            (radius * 2) + tokenWidth,
            (radius * 2) + tokenHeight,
        );

        const direction = Math.toRadians(tokenDocument.rotation) + Math.toRadians(auraRing.direction);
        canvas.rotation = direction;
        
        //canvas.rotation = auraRing.direction;
    }

    /**
     * Create a conical square Aura Ring
     * @param {PIXI.Graphics} canvas
     * @param {AuraRing} auraRing
     * @param {Point} origin
     * @param {number} radius
     * @param {number} rotation
     * @param {boolean} close
     */
    static cone(canvas, auraRing, origin, radius, rotation, close)
    {
        // auraRing.angle, 
        // auraRing.direction,

        /*
        const gridSize = game.canvas.grid.size;
        const tokenHeight = gridSize * (simpleTokenDocument.height / 2);
        const tokenWidth = gridSize * (simpleTokenDocument.width / 2);

        const h = radius / Math.cos(auraRing.angle);
        const o = Math.cos(auraRing.angle / h);

        canvas.drawCircle(radius + tokenHeight, o + tokenWidth, 5);
        canvas.drawCircle(o + tokenWidth, radius + tokenHeight, 5);
        */
    }
}
