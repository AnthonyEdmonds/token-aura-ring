export class Point
{
    /** @type {number} */
    #x = 0;

    /** @type {number} */
    #y = 0;

    /**
     * Create a new Point
     * @param {number|float} x
     * @param {number|float} y
     */
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    /** @returns {number} */
    get x() {
        return this.#x;
    }

    /** @returns {number} */
    get y() {
        return this.#y;
    }

    /** @param {number} value */
    set x(value) {
        this.#x = Math.round(value);
    }

    /** @param {number} value */
    set y(value) {
        this.#y = Math.round(value);
    }

    // Angles

    /**
     * Calculate the angle from the origin to the target in a clockwise direction
     * @param {Point} origin 
     * @param {Point} target
     * @param {number|float} offset
     * @param {boolean} relative
     * @returns {float} The angle in degrees
     */
    static angleBetween(origin, target, offset = 0, relative = false)
    {
        const degreesPerRadian = 180 / Math.PI;
        const distanceX = origin.distanceX(target);
        const distanceY = origin.distanceY(target);

        const negativeX = origin.x > target.x;
        const negativeY = origin.y > target.y;
        let angle = 0;
        let offsetAngle = 0;

        if (negativeX === true && negativeY === true) {
            offsetAngle = 180;
        } else if (negativeX === false && negativeY === true) {
            offsetAngle = 270;
        } else if (negativeX === false && negativeY === false) {
            offsetAngle = 0;
        } else {
            offsetAngle = 90;
        }

        angle = negativeX === negativeY
            ? Math.atan(distanceY / distanceX)
            : Math.atan(distanceX / distanceY);

        angle = (angle * degreesPerRadian) + offsetAngle;

        return relative === true
            ? Point.relativeAngle(angle - offset)
            : angle - offset;
    }

    /**
     * Get the angle relative to 0 (right-hand side in Foundry)
     * @param {number|float} angle 
     * @returns {number|float}
     */
    static relativeAngle(angle)
    {
        angle = (angle + 360) % 360;

        return angle > 180
            ? angle -= 360
            : angle;
    }

    /**
     * Get the angle from this Point to another
     * @param {Point} point
     * @param {number|float} offset
     * @param {boolean} relative
     * @returns {number|float}
     */
    angleTo(point, offset = 0, relative = false)
    {
        return Point.angleBetween(this, point, offset, relative);
    }

    // Comparisons

    /**
     * Whether this point is aligned with the grid
     * @param {number} gridSize 
     * @returns {boolean}
     */
    isOnGrid(gridSize)
    {
        return this.x % gridSize === 0
            && this.y % gridSize === 0;
    }

    /**
     * Whether this Point has the same co-ordinates as another Point
     * @param {Point} point
     * @returns {boolean}
     */
    matches(point)
    {
        return this.x === point.x
            && this.y === point.y;
    }

    // Distances

    /**
     * Find the absolute difference between two numbers
     * @param {number|float} start 
     * @param {number|float} end 
     * @returns {number|float}
     */
    static absoluteDifference(start, end)
    {
        return Math.abs(start - end);
    }

    /**
     * Calculate the distance between two points
     * @param {Point} origin 
     * @param {Point} target 
     * @returns {number|float}
     */
    static distanceBetween(origin, target)
    {
        return Math.hypot(
            Point.absoluteDifference(origin.x, target.x), 
            Point.absoluteDifference(origin.y, target.y),
        );
    }

    /**
     * Find the relative difference between to numbers
     * @param {number|float} origin 
     * @param {number|float} comparator 
     * @returns {number|float}
     */
    static relativeDifference(origin, comparator)
    {
        const difference = Point.absoluteDifference(origin, comparator);

        return comparator < origin
            ? -difference
            : difference;
    }

    /**
     * Get the distance between this Point and another
     * @param {Point} point 
     * @returns {number|float}
     */
    distanceTo(point)
    {
        return Point.distanceBetween(this, point);
    }

    /**
     * Get the distance on the X axis between this Point and another
     * @param {Point} point 
     * @returns {number|float}
     */
    distanceX(point)
    {
        return Point.absoluteDifference(this.x, point.x);
    }

    /**
     * Get the distance on the Y axis between this Point and another
     * @param {Point} point 
     * @returns {number|float}
     */
    distanceY(point)
    {
        return Point.absoluteDifference(this.y, point.y);
    }

    // Movement

    /**
     * Move a point at an angle anti-clockwise
     * @param {number|float} angle
     * @param {number} distance
     */
    moveAnticlockwise(angle, distance)
    {
        switch (true) {
            case angle === 0:
            case angle === 360:
            case angle < 360 && angle > 315:
                this.x += distance;
                break;

            case angle === 315:
            case angle < 315 && angle > 270:
                this.x += distance;
                this.y -= distance;
                break;

            case angle === 270:
            case angle < 270 && angle > 225:
                this.y -= distance;
                break;

            case angle === 225:
            case angle < 225 && angle > 180:
                this.x -= distance;
                this.y -= distance;
                break;

            case angle === 180:
            case angle < 180 && angle > 135:
                this.x -= distance;
                break;

            case angle === 135:
            case angle < 135 && angle > 90:
                this.x -= distance;
                this.y += distance;
                break;

            case angle === 90:
            case angle < 90 && angle > 45:
                this.y += distance;
                break;

            case angle === 45:
            case angle < 45 && angle > 0:
                this.x += distance;
                this.y += distance;
                break;
        }
    }

    /**
     * Move a point at an angle clockwise
     * @param {number|float} angle
     * @param {number} distance
     */
    moveClockwise(angle, distance)
    {
        switch (true) {
            case angle === 0:
            case angle === 360:
            case angle > 0 && angle < 45:
                this.x += distance;
                break;

            case angle === 45:
            case angle > 45 && angle < 90:
                this.x += distance;
                this.y += distance;
                break;

            case angle === 90:
            case angle > 90 && angle < 135:
                this.y += distance;
                break;

            case angle === 135:
            case angle > 135 && angle < 180:
                this.x -= distance;
                this.y += distance;
                break;

            case angle === 180:
            case angle > 180 && angle < 225:
                this.x -= distance;
                break;

            case angle === 225:
            case angle > 225 && angle < 270:
                this.x -= distance;
                this.y -= distance;
                break;

            case angle === 270:
            case angle > 270 && angle < 315:
                this.y -= distance;
                break;

            case angle === 315:
            case angle > 315 && angle < 360:
                this.x += distance;
                this.y -= distance;
                break; 
        }
    }

    /**
     * Move a point by an amount
     * @param {number} x
     * @param {number} y
     */
    moveBy(x, y)
    {
        this.x += x;
        this.y += y;
    }

    /**
     * Move a point to a co-ordinate
     * @param {number} x
     * @param {number} y
     */
    moveTo(x, y)
    {
        this.x = x;
        this.y = y;
    }
}
