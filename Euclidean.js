import { Point } from "./Point.js";

export class Euclidean
{
    /**
     * Draw a euclidean Aura Ring
     * @param {PIXI.Graphics} canvas 
     * @param {AuraRing} auraRing 
     * @param {Token} token 
     * @param {boolean} close 
     */
    static draw(canvas, auraRing, token, close)
    {
        auraRing.angle === 360
            ? Euclidean.circle(canvas, auraRing, token)
            : Euclidean.cone(canvas, auraRing, token, close);
    }

    /**
     * Create a circular euclidean Aura Ring
     * @param {PIXI.Graphics} canvas
     * @param {AuraRing} auraRing
     * @param {Token} token
     */
    static circle(canvas, auraRing, token)
    {
        const radius = Euclidean.pixelRadius(auraRing.radius);

        token.document.width > 1 || token.document.height > 1
            ? canvas.drawRoundedRect(
                -radius - (token.w / 2),
                -radius - (token.h / 2),
                (radius * 2) + token.w,
                (radius * 2) + token.h,
                radius,
            )
            : canvas.drawCircle(0, 0, radius + (token.w / 2));
    }

    /**
     * Create a conical euclidean Aura Ring
     * @param {PIXI.Graphics} canvas
     * @param {AuraRing} auraRing
     * @param {Token} token
     * @param {boolean} close
     */
    static cone(canvas, auraRing, token, close)
    {
        // TODO Projection is incorrect on larger creatures; corners being cut

        const origin = new Point();
        const radius = Euclidean.pixelRadius(auraRing.radius) + (token.w / 2);

        const points = Euclidean.arcPoints(
            origin,
            radius,
            auraRing.angle,
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
        
        console.warn(
            canvas,
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
     * @returns {Object}
     */
    static arcPoints(origin, radius, angle)
    {
        const startDegrees = -90 - (angle / 2);
        const radiansPerDegree = Math.PI / 180;
        const startAngle = startDegrees * radiansPerDegree;
        const endAngle = (startDegrees + angle) * radiansPerDegree;

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
     * @returns {number}
     */
    static pixelRadius(radius)
    {
        const grid = game.canvas.grid;
        return (radius * (grid.size / grid.distance));
    }
}
