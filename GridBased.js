// TODO Normalise radius to nearest round value
export class GridBased
{
    static draw(canvas, auraRing, tokenOffsetX, tokenOffsetY, tokenRotation, tokenWidth)
    {
        const gridDistance = game.canvas.grid.distance;
        let radius = auraRing.radius + ((tokenWidth - 1) * gridDistance);
        radius = Math.round(radius / gridDistance) * gridDistance;

        auraRing.angle === 360
            ? GridBased.circle(canvas, tokenOffsetX, tokenOffsetY, radius, tokenWidth)
            : GridBased.cone(canvas, auraRing, tokenOffsetX, tokenOffsetY, radius, tokenRotation, tokenWidth);
    }

    static circle(canvas, tokenOffsetX, tokenOffsetY, radius)
    {
        let points = game.canvas.grid.getCircle({x: 0, y: 0}, radius);

        points = GridBased.addCorners(points);
        GridBased.centralise(points, tokenOffsetX, tokenOffsetY);
        GridBased.drawFromPoints(canvas, points);

        canvas.closePath();
    }

    static cone(canvas, auraRing, tokenOffsetX, tokenOffsetY, radius, tokenRotation, tokenWidth)
    {
        const direction = -90 + auraRing.direction + tokenRotation;

        let points = game.canvas.grid.getCone({x: 0, y: 0}, radius, direction, auraRing.angle + 1);
        points.push({x: 0, y:0});

        //points = GridBased.align(points);
        points = GridBased.addConeEnds(points);
        //points = GridBased.addCorners(points); -- Need to add path points first
        GridBased.centralise(points, tokenOffsetX, tokenOffsetY);
        GridBased.debugDraw(canvas, points);
        GridBased.drawFromPoints(canvas, points);

        canvas.closePath();
    }

    static addCorners(points)
    {
        const newPoints = [];
        let previousPoint = points[0];

        for (const index in points) {
            const point = points[index];
            
            if (
                point.y !== previousPoint.y
                && point.x !== previousPoint.x
            ) {
                const horizontal = point.x - previousPoint.x > 0 === point.y - previousPoint.y > 0;

                newPoints.push({
                    x: horizontal === true
                        ? point.x
                        : previousPoint.x,
                    y: horizontal === true
                        ? previousPoint.y
                        : point.y,
                });
            }

            newPoints.push(point);
            previousPoint = point;
        }

        return newPoints;
    }

    static addConeEnds(points)
    {
        const pointsToArc = GridBased.addConeEnd(points[1]);
        points.splice(1, 0, ...pointsToArc.reverse());

        const pointsToCentre = GridBased.addConeEnd(points.slice(-2)[0]);
        points.splice(-1, 0, ...pointsToCentre);

        return points;
    }

    static addConeEnd(point)
    {
        const points = [];
        const pointX = Math.abs(point.x);
        const pointY = Math.abs(point.y);
        const gridSize = game.canvas.grid.size;

        const horizontalSteps = pointX / gridSize;
        const verticalSteps = pointY / gridSize;

        const steps = horizontalSteps + verticalSteps;

        const horiztonalInterval = Math.ceil(steps / horizontalSteps);
        const verticalInterval = Math.ceil(steps / verticalSteps);

        const offsetX = point.x < 0
            ? gridSize
            : -gridSize;

        const offsetY = point.y < 0
            ? gridSize
            : -gridSize;

        let currentX = point.x;
        let currentY = point.y;

        for(let step = 1; step <= steps; step++) {
            if (step % horiztonalInterval === 0) {
                currentX += offsetX;
            }

            if (step % verticalInterval === 0) {
                currentY += offsetY;
            }
            
            points.push({
                x: currentX,
                y: currentY,
            });
        }

        /*
        console.warn({
            pointX: pointX,
            pointY: pointY,
            horizontalSteps: horizontalSteps,
            verticalSteps: verticalSteps,
            steps: steps,
            horiztonalInterval: horiztonalInterval,
            verticalInterval: verticalInterval,
        });
        */

        return points;
    }

    // Need to add flexibility for when it covers centre of square.
    static align(points)
    {
        const gridSpacing = game.canvas.grid.size / 2;

        return points.filter(function (point) {
            return point.x % gridSpacing === 0
                && point.y % gridSpacing === 0
        });
    }

    static centralise(points, tokenOffsetX, tokenOffsetY)
    {
        for (const point of points) {
            point.x += tokenOffsetX;
            point.y += tokenOffsetY;
        }
    }

    static drawFromPoints(canvas, points)
    {
        for (const point of points) {
            canvas.lineTo(point.x, point.y);
        }
    }

    

    /* --- Legacy --- */
    static completeGridConePath(centres)
    {
        const vertical = start.x === end.x;
    }

    static completeGridConeSection(centre, vertical) 
    {
        const newCentres = [];
        const gridSize = game.canvas.grid.size;

        let steps = (Math.abs(centre.x) + Math.abs(centre.y)) / gridSize;
        let currentX = centre.x;
        let currentY = centre.y;

        for (steps; steps > 0; steps--) {
            if (vertical === true) {
                currentY < 0
                    ? currentY += gridSize
                    : currentY -= gridSize;
            } else {
                currentX < 0
                    ? currentX += gridSize
                    : currentX -= gridSize;
            }

            newCentres.push({
                x: currentX,
                y: currentY,
            });

            vertical = !vertical;
        }

        return newCentres;
    }

    static debugDraw(canvas, points)
    {
        let current = 5;
        for (const point of points) {
            canvas.drawCircle(point.x, point.y, current);
            current++;
        }

        canvas.startPoly();
        canvas.lineStyle(3, '#000000', 1);
        for (const point of points) {
            canvas.lineTo(point.x, point.y);
        }
        canvas.lineStyle(0, '#000000', 0, 0);
        canvas.finishPoly();
    }
}
