// TODO Normalise radius to nearest round value
export class GridBased
{
    static draw(canvas, auraRing, originX, originY, tokenRotation, tokenWidth)
    {
        auraRing.angle === 360
            ? GridBased.circle(canvas, auraRing, originX, originY)
            : GridBased.cone(canvas, auraRing, originX, originY, tokenRotation, tokenWidth);
    }

    static circle(canvas, auraRing, originX, originY)
    {
        let centres = game.canvas.grid.getCircle({x: 0, y: 0}, auraRing.radius);
        
        centres = GridBased.offsetGridShapeCentres(centres, originX, originY);
        GridBased.drawGridShapeFromCentres(centres);

        canvas.closePath();
    }

    static cone(canvas, auraRing, originX, originY, tokenRotation, tokenWidth)
    {
        const direction = -90 + auraRing.direction + tokenRotation;
        let centres = game.canvas.grid.getCone({x: 0, y: 0}, auraRing.radius, direction, auraRing.angle + 1);
        centres.shift();

        centres = GridBased.removeMisalignedGridChapeCentres(centres);
        GridBased.completeGridConePath(centres, originX, originY);
        GridBased.offsetGridShapeCentres(centres, originX, originY, tokenWidth);
        GridBased.debugDraw(canvas, centres);

        canvas.moveTo(originX, originY);
        GridBased.drawGridShapeFromCentres(centres);
        canvas.closePath();
    }

    // Add tolerance to grid cell culling
    static removeMisalignedGridChapeCentres(centres)
    {
        const gridSpacing = game.canvas.grid.size / 2;

        return centres.filter(function (centre) {
            return centre.x % gridSpacing === 0
                && centre.y % gridSpacing === 0
        });
    }

    static offsetGridShapeCentres(centres, originX, originY, tokenWidth)
    {
        const gridSpacing = game.canvas.grid.size / 2;
        const gridOffset = (tokenWidth - 1) * gridSpacing;

        for (const centre of centres) {
            if (centre.x !== 0) {
                centre.x < 0
                    ? centre.x -= gridOffset
                    : centre.x += gridOffset;
            }

            if (centre.y !== 0) {
                centre.y < 0
                    ? centre.y -= gridOffset
                    : centre.y += gridOffset;
            }

            centre.x += originX;
            centre.y += originY;
        }
    }

    // Does not handle rotation at all
    // Sides are messed up on narrow, base on wide
    // Look at extending the measured template tool
    static completeGridConePath(centres)
    {
        if (centres.length < 1) {
            return centres;
        }

        const start = centres[0];
        const end = centres.slice(-1)[0];
        const vertical = start.x === end.x;

        const startPath = GridBased.completeGridConeSection(start, vertical);
        centres.splice(0, 0, ...startPath.reverse());
        
        const endPath = GridBased.completeGridConeSection(end, vertical);
        centres.push(...endPath)

        return centres;
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

    static debugDraw(canvas, centres)
    {
        let current = 5;
        for (const centre of centres) {
            canvas.drawCircle(centre.x, centre.y, current);
            current++;
        }

        canvas.startPoly();
        canvas.lineStyle(3, '#000000', 1);
        for (const centre of centres) {
            canvas.lineTo(centre.x, centre.y);
        }
        canvas.lineStyle(0, '#000000', 0, 0);
        canvas.finishPoly();
    }

    static drawGridShapeFromCentres(canvas, centres)
    {
        if (Array.isArray(centres) === false) {
            return;
        }

        if (centres.length < 1) {
            return;
        }

        const gridOffset = game.canvas.grid.size / 2;
        let previousCentre = centres[0];

        for (const centre of centres) {
            if (centre.y !== previousCentre.y && centre.x !== previousCentre.x) {
                const stepX = centre.y < 0
                    ? previousCentre.x + gridOffset
                    : previousCentre.x - gridOffset;

                const stepY = centre.x < 0
                    ? previousCentre.y - gridOffset
                    : previousCentre.y + gridOffset;

                canvas.lineTo(stepX, stepY);
            }

            const centreX = centre.x < 0
                ? centre.x - gridOffset
                : centre.x + gridOffset;

            const centreY = centre.y < 0
                ? centre.y - gridOffset
                : centre.y + gridOffset;

            canvas.lineTo(centreX, centreY);
            previousCentre = centre;
        }
    }
}
