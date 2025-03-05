export class AuraRing
{
    static key = 'aura-rings';

    static namespace = 'token-aura-ring';

    /** @type {number} How wide the Aura Ring should be, from 5 to 360 degrees */
    angle = 360;

    /** @type {number} Which way the Aura Ring should face, from -180 to 180 degrees */
    direction = 0;

    /** @type {string} The fill colour in hex */
    fill_colour = '#000000';

    /** @type {number} The fill opacity as a fraction between 0 and 1 */
    fill_opacity = 0;

    /** @type {boolean} Whether the Aura Ring should be shown */
    hide = false;

    /** @type {boolean} Whether the Aura Ring should only show when hovered */
    hover_only = false;

    /** @type {number} The unique numeric identifier of the Aura Ring */
    id = 0;

    /** @type {boolean} Whether the Aura Ring is square */
    is_square = false;

    /** @type {string} The display name of the Aura Ring */
    name = 'Aura';

    /** @type {boolean} Whether the Aura Ring should only show for the owner */
    hover_only = false;

    /** @type {number} The radius of the Aura Ring, from 0 */
    radius = 20;

    /** @type {boolean} Whether to hide the Aura Ring when the eminating token cannot be seen */
    respect_fog = true;

    /** @type {boolean} Whether to stroke the complete outline of the Aura Ring */
    stroke_close = false;

    /** @type {string} The stroke colour in hex */
    stroke_colour = '#ff0000';

    /** @type {number} The stroke opacity as a fraction between 0 and 1 */
    stroke_opacity = 0.75;

    /** @type {number} The stroke weight in pixels, from 0 */
    stroke_weight = 4;

    /** @type {boolean} Whether to use grid shapes, if enabled */
    use_grid_shapes = false;

    /** @type {string} Which user roles can see the Aura Ring */
    visibility = 'PLAYER';
}
