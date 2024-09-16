import { Point } from "./Point.js";

export class GridBased
{
    /**
     * An XY co-ordinate
     * @typedef  {Object}   Point
     * @property {number}   x       The horizontal location of the point
     * @property {number}   y       The vertical location of the point
     */

    static draw(canvas, auraRing, simpleTokenDocument)
    {
        const gridDistance = game.canvas.grid.distance;
        const gridSize = game.canvas.grid.size;
        const gridOffset = gridSize / 2;

        let radius = Math.round(auraRing.radius / gridDistance) * gridDistance;
        const origins = GridBased.originPoints(simpleTokenDocument, gridSize, gridOffset);

        auraRing.angle === 360
            ? GridBased.circle(canvas, simpleTokenDocument, origins, radius, gridSize, gridOffset)
            : GridBased.cone(canvas, radius);
    }

    static circle(canvas, simpleTokenDocument, origins, radius, gridSize, gridOffset)
    {
        GridBased.drawPoints(
            canvas, 
            simpleTokenDocument,
            GridBased.baseCircle(simpleTokenDocument, origins, radius, gridSize, gridOffset),
            gridOffset,
        );
    }

    static cone(canvas, radius)
    {
        console.warn('Cone');
    }

    // Shapes

    /**
     * Draw a 360 degree circle around a token
     * @param {SimpleTokenDocument} simpleTokenDocument
     * @param {Point[]} origins
     * @param {number} radius
     * @returns {Point[]}
     */
    static baseCircle(simpleTokenDocument, origins, radius, gridSize, gridOffset)
    {
        const min = gridOffset;
        const maxHeight = ((simpleTokenDocument.height - 1) * gridSize) + gridOffset;
        const maxWidth = ((simpleTokenDocument.width - 1) * gridSize) + gridOffset;
        let points = [];

        for (const origin of origins) {
            if (origin.x === min && origin.y === min) {
                points.push(...GridBased.baseCorner(origin, radius, 225));
            }

            if (origin.x === maxWidth && origin.y === min) {
                points.push(...GridBased.baseCorner(origin, radius, 315));
            }

            if (origin.x === maxWidth && origin.y === maxHeight) {
                points.push(...GridBased.baseCorner(origin, radius, 45));
            }

            if (origin.x == min && origin.y === maxHeight) {
                points.push(...GridBased.baseCorner(origin, radius, 135));
            }
        }

        points = GridBased.removeDuplicatePoints(points);
        return GridBased.bridgeGaps(points, gridSize);
    }

    /**
     * Draw a 90 degree cone on the corner of a token
     * @param {Point} origin
     * @param {number} radius
     * @param {number} direction
     * @returns {Point[]}
     */
    static baseCorner(origin, radius, direction)
    {
        const points = [];
        const corner = game.canvas.grid.getCone(origin, radius, direction, 90);
        corner.splice(0, 1);

        for (const point of corner) {
            points.push(new Point(point.x, point.y));
        }

        return GridBased.removeDuplicatePoints(points);
    }

    // Points

    /**
     * Bridge the gaps between points on straights and diagonals
     * @param {Point[]} points 
     * @param {number} gridSize 
     * @returns {Point[]}
     */
    static bridgeGaps(points, gridSize)
    {
        const bridgedPoints = [];
        let previousPoint = points[points.length - 1];
        let differenceX = 0;
        let differenceY = 0;

        for (const point of points) {
            do {
                let bridgeX = previousPoint.x;
                let bridgeY = previousPoint.y;

                differenceX = Math.abs(point.x - previousPoint.x);
                differenceY = Math.abs(point.y - previousPoint.y);

                if (differenceX === gridSize && differenceY === gridSize) {
                    const directionX = previousPoint.x < point.x;
                    const directionY = previousPoint.y < point.y;

                    if (directionX === directionY) {
                        bridgeY += directionY === true ? gridSize : -gridSize;
                    } else {
                        bridgeX += directionX === true ? gridSize : -gridSize;
                    }

                } else if (differenceX > gridSize && differenceY <= gridSize) {
                    bridgeX += previousPoint.x < point.x ? gridSize : -gridSize;
                } else if (differenceX <= gridSize && differenceY > gridSize) {
                    bridgeY += previousPoint.y < point.y ? gridSize : -gridSize;
                } else {
                    break;
                }

                const newPoint = new Point(bridgeX, bridgeY);
                bridgedPoints.push(newPoint);
                previousPoint = newPoint;
            } while (differenceX > gridSize || differenceY > gridSize);

            bridgedPoints.push(point);
            previousPoint = point;
        }

        return bridgedPoints;
    }

    /**
     * Draw points onto the canvas
     * @param {PIXI.Graphics} canvas
     * @param {SimpleTokenDocument} simpleTokenDocument
     * @param {Point[]} points
     * @param {number} gridOffset
     */
    static drawPoints(canvas, simpleTokenDocument, points, gridOffset)
    {
        const originX = simpleTokenDocument.object.w / 2;
        const originY = simpleTokenDocument.object.h / 2;
        let first = true;

        for (const point of points) {
            point.x += point.x <= originX
                ? -gridOffset
                : gridOffset;

            point.y += point.y <= originY
                ? -gridOffset
                : gridOffset;

            if (first === true) {
                canvas.moveTo(point.x, point.y);
                first = false;
            } else {
                canvas.lineTo(point.x, point.y);
            }
        }

        canvas.closePath();
    }

    /**
     * Get all token origin points to measure from
     * @param {SimpleTokenDocument} simpleTokenDocument
     * @param {number} gridSize
     * @param {number} gridOffset
     * @returns {Point[]}
     */
    static originPoints(simpleTokenDocument, gridSize, gridOffset)
    {
        const tokenHeight = simpleTokenDocument.height;
        const tokenWidth = simpleTokenDocument.width;
        const originPoints = [];
        let currentX = 0;
        let currentY = 0;

        for (currentX = 0; currentX < tokenWidth; currentX++) {
            originPoints.push(new Point(
                (gridSize * currentX) + gridOffset,
                (gridSize * currentY) + gridOffset,
            ));
        }

        currentX--;
        for (currentY = 1; currentY < tokenHeight; currentY++) {
            originPoints.push(new Point(
                (gridSize * currentX) + gridOffset,
                (gridSize * currentY) + gridOffset,
            ));
        }

        currentX--;
        currentY--;
        for (currentX; currentX > 0; currentX--) {
            originPoints.push(new Point(
                (gridSize * currentX) + gridOffset,
                (gridSize * currentY) + gridOffset,
            ));
        }

        for (currentY; currentY > 0; currentY--) {
            originPoints.push(new Point(
                (gridSize * currentX) + gridOffset,
                (gridSize * currentY) + gridOffset,
            ));
        }

        return originPoints;
    }

    /**
     * Remove duplicated sequential points
     * @param {Point[]} points
     * @returns {Point[]}
     */
    static removeDuplicatePoints(points)
    {
        const uniquePoints = [];
        let previousPoint = points[points.length - 1]

        for (const point of points) {
            if (point.x !== previousPoint.x || point.y !== previousPoint.y) {
                uniquePoints.push(point);
                previousPoint = point;
            } 
        }

        return uniquePoints;
    }
    
    // Debug

    static debugDrawPoints(canvas, points, strokeColour = '#ff0000', fillColour = '#00ff00')
    {
        let current = 5;

        canvas.lineStyle(3, strokeColour, 1, 0.5);
        for (let point of points) {
            canvas.lineTo(point);
        }

        canvas.lineStyle(3, fillColour, 1, 0.5);
        for (let point of points) {
            canvas.drawCircle(point.x, point.y, current);
            current+=0.5;
        }
    }
}
