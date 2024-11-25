import { Euclidean } from "./Euclidean.js";
import { Point } from "./Point.js";

// TODO Need to expand circle based on irregular token

export class GridBased
{
    /**
     * Draw a grid-based Aura Ring
     * @param {PIXI.Graphics} canvas 
     * @param {AuraRing} auraRing 
     * @param {SimpleTokenDocument} simpleTokenDocument 
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
            : GridBased.cone(canvas, simpleTokenDocument, origins, radius, auraRing.angle, auraRing.direction, simpleTokenDocument.rotation, gridSize, gridOffset);
    }

    /**
     * Draw a circular grid-based Aura Ring
     * @param {PIXI.Graphics} canvas 
     * @param {SimpleTokenDocument} simpleTokenDocument 
     * @param {Point[]} origins 
     * @param {number} radius 
     * @param {number} gridSize 
     * @param {number} gridOffset 
     */
    static circle(canvas, simpleTokenDocument, origins, radius, gridSize, gridOffset)
    {
        GridBased.drawPoints(
            canvas, 
            simpleTokenDocument,
            GridBased.baseCircle(simpleTokenDocument, origins, radius, gridSize, gridOffset),
            gridOffset,
        );
    }

    /**
     * Draw a conical grid-based Aura Ring
     * @param {PIXI.Graphics} canvas 
     * @param {SimpleTokenDocument} simpleTokenDocument 
     * @param {Point[]} origins 
     * @param {number} radius 
     * @param {number} angle 
     * @param {number} direction 
     * @param {number} rotation 
     * @param {number} gridSize 
     * @param {number} gridOffset 
     */
    static cone(canvas, simpleTokenDocument, origins, radius, angle, direction, rotation, gridSize, gridOffset)
    {
        const origin = new Point(
            (simpleTokenDocument.width * gridSize) / 2, 
            (simpleTokenDocument.height * gridSize) / 2
        );

        const circle = GridBased.baseCircle(simpleTokenDocument, origins, radius, gridSize, gridOffset);
        const pixelRadius = Euclidean.pixelRadius(radius, origin);
        const arcPoints = Euclidean.arcPoints(origin, pixelRadius, angle, direction, rotation);

        const closestCircleToStart = GridBased.getClosestPointTo(origin,  arcPoints.start, circle, false);
        const closestCircleToEnd = GridBased.getClosestPointTo(origin,  arcPoints.end, circle, true);
        const closestOriginToStart = GridBased.getClosestPointTo(origin, arcPoints.start, origins, false);
        const closestOriginToEnd = GridBased.getClosestPointTo(origin, arcPoints.end, origins, true);

        let cone = GridBased.removePointsBetween(circle, closestCircleToEnd, closestCircleToStart);
        GridBased.addCorners(cone);
        cone.unshift(
            new Point(origin.x, origin.y),
            closestOriginToStart,
            ...GridBased.connectEnd(closestOriginToStart, closestCircleToStart, gridSize, false),
        );
        cone.push(
            ...GridBased.connectEnd(closestOriginToEnd, closestCircleToEnd, gridSize, true),
            closestOriginToEnd,
            new Point(origin.x, origin.y),
        );
        cone = GridBased.bridgeGaps(cone, gridSize, true);
        cone = GridBased.removeDuplicatePoints(cone);

        // GridBased.debugDrawPoints(canvas, cone, '#00ff00', '#222222');
        GridBased.drawAroundPointsClockwise(canvas, cone, origin, gridSize, gridOffset);
    }

    // Shapes

    /**
     * Draw a 360 degree circle around a token
     * @param {SimpleTokenDocument} simpleTokenDocument
     * @param {Point[]} origins
     * @param {number} radius
     * @param {number} gridSize
     * @param {number} gridOffset
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
     * Add extra points to complete the end of an arc
     * @param {Point[]} points
     */
    static addCorners(points)
    {
        const start = points[0];
        const end = points[points.length - 1];

        points.unshift(
            new Point(start.x, start.y),
        );

        points.push(
            new Point(end.x, end.y),
        );
    }

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

                if (differenceX >= gridSize && differenceY >= gridSize) {
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
     * Get the Points needed to connect one point to another
     * @param {Point} origin 
     * @param {Point} target
     * @param {number} gridSize
     * @param {boolean} clockwise
     * @returns {Point[]}
     */
    static connectEnd(origin, target, gridSize, clockwise)
    {
        const points = [];
        const targetDistance = Point.distanceBetween(
            target, 
            new Point(target.x - gridSize, target.y - gridSize),
        );

        let angle = 0;
        let currentPoint = origin;
        let distance = origin.distanceTo(target);

        while (distance > targetDistance) {
            const point = new Point(currentPoint.x, currentPoint.y);
            angle = currentPoint.angleTo(target);

            clockwise === true
                ? point.moveClockwise(angle, gridSize)
                : point.moveAnticlockwise(angle, gridSize);

            points.push(point);

            currentPoint = point;
            distance = currentPoint.distanceTo(target);
        }

        return clockwise === true
            ? points.reverse()
            : points;
    }


    /**
     * Draw points onto the canvas wrapping clockwise
     * @param {PIXI.Graphics} canvas 
     * @param {Point[]} points
     * @param {Point} origin
     * @param {number} gridSize
     * @param {number} gridOffset
     */
    static drawAroundPointsClockwise(canvas, points, origin, gridSize, gridOffset)
    {
        const cursor = new Point()

        for (let index = 0; index < points.length; ++index) {
            const currentPoint = points[index];

            if (index === 0) {
                cursor.moveTo(currentPoint.x, currentPoint.y);

                if (currentPoint.isOnGrid(gridSize) === false) {
                    const angle = cursor.angleTo(origin);
                    const modifier = angle % 90 === 0 ? 45 : 0;
                    cursor.moveClockwise(angle + modifier, gridOffset);
                }

                canvas.moveTo(cursor.x, cursor.y);
            }

            if (currentPoint.isOnGrid(gridSize) === true) {
                cursor.moveTo(currentPoint.x, currentPoint.y);
                canvas.lineTo(currentPoint.x, currentPoint.y);
                continue;
            }

            const nextPoint = index === points.length - 1
                ? points[0]
                : points[index + 1];

            const outgoingAngle = currentPoint.angleTo(nextPoint);

            let targetAngle;

            switch (outgoingAngle) {
                case 0:
                    targetAngle = 315;
                    break;

                case 45:
                case 135:
                case 225:
                case 315:
                    targetAngle = outgoingAngle;
                    break;

                default:
                    targetAngle = outgoingAngle - 45
                    break;
            }

            let cursorAngle = currentPoint.angleTo(cursor);
            let safety = 4;

            while (cursorAngle !== targetAngle) {
                switch (cursorAngle) {
                    case 45:
                        cursor.moveBy(-gridSize, 0);
                        break;

                    case 135:
                        cursor.moveBy(0, -gridSize);
                        break;

                    case 225:
                        cursor.moveBy(gridSize, 0);
                        break;

                    case 315:
                        cursor.moveBy(0, gridSize);
                        break;
                }

                canvas.lineTo(cursor.x, cursor.y);
                cursorAngle = currentPoint.angleTo(cursor);

                safety--;
                if (safety === 0) {
                    console.warn('Safety hit');
                    break;
                }
            }
        }

        canvas.closePath();
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
            if (point.x !== originX || point.y !== originY) {
                point.x += point.x <= originX
                    ? -gridOffset
                    : gridOffset;
            
                point.y += point.y <= originY
                    ? -gridOffset
                    : gridOffset;
            }

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
     * Find a Point which is closest to a given target angle based on an origin
     * @param {Point} origin
     * @param {Point} target
     * @param {Point[]} points
     * @param {boolean} clockwise
     * @returns {Point} The Point closest to the target angle
     */
    static getClosestPointTo(origin, target, points, clockwise = true)
    {
        if (points.length === 1) {
            return points[0];
        }

        const targetDistance = origin.distanceTo(target);
        let targetAngle = origin.angleTo(target);
        let closestPoint = points[0];
        let closestAngle = clockwise === true ? -181 : 181;

        targetAngle = targetAngle < 0
            ? ((targetAngle - 360) % 360) + 360
            : targetAngle % 360;

        for (const point of points) {
            const pointDistance = origin.distanceTo(point);

            if (pointDistance > targetDistance) {
                continue;
            }

            const pointAngle = origin.angleTo(point, targetAngle, true);

            if (clockwise === true) {
                if (
                    pointAngle <= 0
                    && pointAngle > closestAngle
                ) {
                    closestAngle = pointAngle;
                    closestPoint = point;
                }
            } else {
                if (
                    pointAngle >= 0
                    && pointAngle < closestAngle
                ) {
                    closestAngle = pointAngle;
                    closestPoint = point;
                }
            }
        };

        return closestPoint;
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

    /**
     * Remove Points which sit between a start and an end Point
     * @param {Point[]} points 
     * @param {Point} start 
     * @param {Point} end
     * @returns {Point[]}
     */
    static removePointsBetween(points, start, end)
    {
        const adjusted = [];
        const append = [];
        let endIndex = null;
        let inverse = false;
        let startIndex = null;

        for (let index = 0; index < points.length; ++index) {
            const point = points[index];

            if (
                startIndex === null
                && point.matches(start) === true
            ) {
                startIndex = parseInt(index);
            }

            if (
                endIndex === null
                && point.matches(end) === true
            ) {
                endIndex = parseInt(index);
            }

            if (startIndex !== null && endIndex !== null) {
                break;
            }
        }

        if (startIndex > endIndex) {
            let swap = startIndex;
            inverse = true;
            startIndex = endIndex;
            endIndex = swap;
        }

        for (let index = 0; index < points.length; ++index) {
            if (inverse === true) {
                if (index < startIndex || index > endIndex) {
                    continue;
                }
            } else {
                if (index > startIndex && index < endIndex) {
                    continue;
                }

                if (index <= startIndex) {
                    append.push(points[index]);
                    continue;
                }
            }

            adjusted.push(points[index]);
        }

        adjusted.push(...append);
        return adjusted;
    }

    // Debug

    static debugDrawPoints(canvas, points)
    {
        let current = 5;

        for (let point of points) {
            canvas.lineStyle(3, '#ff0000');
            canvas.drawCircle(point.x, point.y, current);
            current+=0.5;
        }
    }
}
