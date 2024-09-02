export class Euclidean
{
    static draw(canvas, auraRing, originX, originY, tokenRotation, close)
    {
        const grid = game.canvas.grid;
        const radius = (auraRing.radius * (grid.size / grid.distance)) + originX;

        auraRing.angle === 360
            ? Euclidean.circle(canvas, originX, originY, radius)
            : Euclidean.cone(canvas, auraRing, originX, originY, radius, tokenRotation, close);
    }

    static circle(canvas, originX, originY, radius)
    {
        canvas.drawCircle(originX, originY, radius);
    }

    static cone(canvas, auraRing, originX, originY, radius, tokenRotation, close)
    {
        const radiansPerDegree = Math.PI / 180;
        const startAngle = ((-90 + auraRing.direction + tokenRotation) - (auraRing.angle / 2)) * radiansPerDegree;
        const endAngle = startAngle + (auraRing.angle * radiansPerDegree);
        const arcStartX = originX + radius * Math.cos(startAngle);
        const arcStartY = originY + radius * Math.sin(startAngle);
        
        if (close === true) {
            canvas.moveTo(originX, originY);
            canvas.lineTo(arcStartX, arcStartY);
        }
        
        canvas.arc(originX, originY, radius, startAngle, endAngle);
        
        if (close === true) {
            canvas.lineTo(originX, originY);
            canvas.closePath();
        }
    }
}
