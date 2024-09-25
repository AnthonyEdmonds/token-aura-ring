import { Point } from "./Point.js";

export class Euclidean
{
    /**
     * Draw a euclidean Aura Ring
     * @param {PIXI.Graphics} canvas 
     * @param {AuraRing} auraRing 
     * @param {SimpleTokenDocument} simpleTokenDocument 
     * @param {boolean} close 
     */
    static draw(canvas, auraRing, simpleTokenDocument, close)
    {
        const origin = new Point(
            simpleTokenDocument.object.w / 2,
            simpleTokenDocument.object.h / 2,
        );

        const radius = Euclidean.pixelRadius(auraRing.radius, origin);

        auraRing.angle === 360
            ? Euclidean.circle(canvas, simpleTokenDocument, auraRing.radius)
            : Euclidean.cone(canvas, auraRing, origin, radius, simpleTokenDocument.rotation, close);
    }

    /**
     * Create a circular euclidean Aura Ring
     * @param {PIXI.Graphics} canvas
     * @param {SimpleTokenDocument} simpleTokenDocument
     * @param {number} radius
     */
    static circle(canvas, simpleTokenDocument, radius)
    {
        const gridSize = game.canvas.grid.size;
        const tokenHeight = gridSize * simpleTokenDocument.height;
        const tokenWidth = gridSize * simpleTokenDocument.width;
        const tokenOffset = gridSize * (simpleTokenDocument.width - 1);
        radius = Euclidean.pixelRadius(radius, new Point());

        canvas.drawRoundedRect(
            -radius,
            -radius,
            (radius * 2) + tokenWidth,
            (radius * 2) + tokenHeight,
            (radius + tokenWidth) - tokenOffset,
        );
    }

    /**
     * Create a conical euclidean Aura Ring
     * @param {PIXI.Graphics} canvas
     * @param {AuraRing} auraRing
     * @param {Point} origin
     * @param {number} radius
     * @param {number} rotation
     * @param {boolean} close
     * TODO Projection is incorrect on larger creatures; corners being cut
     */
    static cone(canvas, auraRing, origin, radius, rotation, close)
    {
        const points = Euclidean.arcPoints(
            origin,
            radius,
            auraRing.angle, 
            auraRing.direction, 
            rotation
        );

        if (close === true) {
            canvas.moveTo(origin.x, origin.y);
            canvas.lineTo(points.start.x, points.start.y);
        }

        canvas.arc(
            origin.x,
            origin.y,
            radius,
            origin.angleTo(points.start) * (Math.PI / 180),
            origin.angleTo(points.end) * (Math.PI / 180),
        );
        
        if (close === true) {
            canvas.lineTo(origin.x, origin.y);
            canvas.closePath();
        }
    }

    // Utilities

    /**
     * Get the arc points of a conincal Aura Ring
     * @param {Point} origin
     * @param {number} radius 
     * @param {number} angle 
     * @param {number} direction 
     * @param {number} rotation 
     * @returns {Object}
     */
    static arcPoints(origin, radius, angle, direction, rotation)
    {
        const angleOffset = angle / 2;
        const startDegrees = (-90 + direction + rotation) - angleOffset;
        const endDegrees = startDegrees + angle;

        const radiansPerDegree = Math.PI / 180;
        const startAngle = startDegrees * radiansPerDegree;
        const endAngle = endDegrees * radiansPerDegree;

        return {
            start: new Point(
                origin.x + radius * Math.cos(startAngle),
                origin.y + radius * Math.sin(startAngle),
            ),
            end: new Point(
                origin.x + radius * Math.cos(endAngle),
                origin.y + radius * Math.sin(endAngle),
            ),
        };
    }

    /**
     * Convert the radius in game units to pixels
     * @param {number} radius 
     * @param {Point} origin
     * @returns {number}
     */
    static pixelRadius(radius, origin)
    {
        const grid = game.canvas.grid;
        return (radius * (grid.size / grid.distance)) + origin.x;
    }
}
