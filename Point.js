/**
 * @param {number} x
 */
export class Point
{
    #x = 0;

    #y = 0;

    constructor(x, y)
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
}
