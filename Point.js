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
    constructor(x = 0, y = 0)
    {
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
     * Whether this Point has the same co-ordinates as another Point
     * @param {Point} point
     * @returns {boolean}
     */
    matches(point) {
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
}
