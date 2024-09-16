export class Euclidean
{
    static draw(canvas, auraRing, simpleTokenDocument, close)
    {
        const tokenOffsetX = simpleTokenDocument.object.w / 2;
        const tokenOffsetY = simpleTokenDocument.object.h / 2;
        const radius = Euclidean.pixelRadius(auraRing.radius, tokenOffsetX);

        auraRing.angle === 360
            ? Euclidean.circle(canvas, tokenOffsetX, tokenOffsetY, radius)
            : Euclidean.cone(canvas, auraRing, tokenOffsetX, tokenOffsetY, radius, simpleTokenDocument.rotation, close);
    }

    static circle(canvas, tokenOffsetX, tokenOffsetY, radius)
    {
        canvas.drawCircle(tokenOffsetX, tokenOffsetY, radius);
    }

    static cone(canvas, auraRing, tokenOffsetX, tokenOffsetY, radius, rotation, close)
    {
        const points = Euclidean.arcPoints(
            tokenOffsetX,
            tokenOffsetY,
            radius,
            auraRing.angle, 
            auraRing.direction, 
            rotation
        );

        if (close === true) {
            canvas.moveTo(tokenOffsetX, tokenOffsetY);
            canvas.lineTo(points.start.x, points.start.y);
        }
        
        canvas.arc(tokenOffsetX, tokenOffsetY, radius, points.start.angle, points.end.angle);
        
        if (close === true) {
            canvas.lineTo(tokenOffsetX, tokenOffsetY);
            canvas.closePath();
        }
    }

    // Utilities
    static arcPoints(tokenOffsetX, tokenOffsetY, radius, angle, direction, rotation)
    {
        const radiansPerDegree = Math.PI / 180;
        const startAngle = ((-90 + direction + rotation) - (angle / 2)) * radiansPerDegree;
        const endAngle = startAngle + (angle * radiansPerDegree);

        return {
            start: {
                angle: startAngle,
                x: tokenOffsetX + radius * Math.cos(startAngle),
                y: tokenOffsetY + radius * Math.sin(startAngle),
            },
            end: {
                angle: endAngle,
                x: tokenOffsetX + radius * Math.cos(endAngle),
                y: tokenOffsetY + radius * Math.sin(endAngle),
            },
        };
    }

    static pixelRadius(radius, tokenOffsetX)
    {
        const grid = game.canvas.grid;
        return (radius * (grid.size / grid.distance)) + tokenOffsetX;
    }
}
