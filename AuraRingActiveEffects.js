import { AuraRing } from "./AuraRing.js";

export class AuraRingActiveEffects
{
    static key = 'TokenAuraRing';

    /**
     * Apply active effects to an Aura Ring, if present in the index
     * @param {AuraRing} auraRing The Aura Ring to modify
     * @param {Object} index All active effects on the actor, keyed by Aura Ring name
     */
    static apply(auraRing, index)
    {
        if (typeof index[auraRing.name] !== 'object') {
            return auraRing;
        }

        auraRing = foundry.utils.deepClone(auraRing);
        const fields = Object.getOwnPropertyNames(index[auraRing.name]);

        for (const field of fields) {
            const change = index[auraRing.name][field];

            switch (change.mode) {
                case foundry.CONST.ACTIVE_EFFECT_MODES.ADD:
                case foundry.CONST.ACTIVE_EFFECT_MODES.UPGRADE:
                    auraRing[field] += change.value;
                    break;

                case foundry.CONST.ACTIVE_EFFECT_MODES.DOWNGRADE:
                    auraRing[field] -= change.value;
                    break;

                case foundry.CONST.ACTIVE_EFFECT_MODES.MULTIPLY:
                    auraRing[field] *= change.value;
                    break;

                case foundry.CONST.ACTIVE_EFFECT_MODES.CUSTOM:
                case foundry.CONST.ACTIVE_EFFECT_MODES.OVERRIDE:
                default:
                    auraRing[field] = change.value;
                    break;
            }
        }

        return auraRing;
    }

    /**
     * Generate an index of applicable Aura Ring modifications
     * @param {TokenDocument} tokenDocument The TokenDocument being updated
     * @returns {Object} An index of changes to apply keyed by Aura Ring name
     */
    static index(tokenDocument)
    {
        const index = {};

        if (typeof tokenDocument.actor !== 'object') {
            return index;
        }

        AuraRingActiveEffects.parseAttributes(index, tokenDocument.actor);
        AuraRingActiveEffects.parseAppliedEffects(index, tokenDocument.actor);

        return index;
    }

    /**
     * Check the Actor's attributes for Aura Ring changes
     * @param {Object} index A list of changes captured so far
     * @param {Actor} actor The Actor to get attributes from
     * @returns {Object} The changes to apply keyed by Aura Ring name
     */
    static parseAttributes(index, actor)
    {
        if (typeof actor.system.attributes !== 'object') {
            return index;
        }

        const attributes = Object.getOwnPropertyNames(actor.system.attributes);

        for (const attribute of attributes) {
            AuraRingActiveEffects.parseChange(
                index, 
                actor.system.attributes[attribute].label,
                actor.system.attributes[attribute].value,
                foundry.CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
            );
        }

        return index;
    }

    /**
     * Check the Actor's applied effects for Aura Ring changes
     * @param {Object} index A list of changes captured so far
     * @param {Actor} actor The Actor to get applied effects from
     * @returns {Object} The changes to apply keyed by Aura Ring name
     */
    static parseAppliedEffects(index, actor)
    {
        if (typeof actor.appliedEffects !== 'object') {
            return index;
        }

        for (const appliedEffect of actor.appliedEffects) {
            for (const change of appliedEffect.changes) {
                AuraRingActiveEffects.parseChange(index, change.key, change.value, change.mode);
            }
        }

        return index;
    }

    /**
     * Parse the given string key for the Aura Ring name and property
     * @param {Object} index A list of changes captured so far
     * @param {string} key The key to change in TokenAuraRing.name.property format
     * @param {string} value The value to set the property to
     * @param {int} mode Which mode to apply changes in
     */
    static parseChange(index, key, value, mode)
    {
        if (
            typeof key !== 'string'
            || key.startsWith(AuraRingActiveEffects.key) === false
        ) {
            return;
        }

        const parts = key.split('.');

        if (parts.length !== 3) {
            return;
        }

        const auraName = parts[1];
        const field = parts[2];

        if (field === 'id' || field === 'name') {
            return;
        }

        if (typeof index[auraName] !== 'object') {
            index[auraName] = {};
        }

        index[auraName][field] = {
            mode: mode,
            value: AuraRingActiveEffects.castValue(field, value),
        };
    }

    /**
     * Cast a given value to its proper type
     * @param {string} field The field being set
     * @param {string|number|bool} value The value to be cast
     * @returns {string|number|bool} The cast value
     */
    static castValue(field, value)
    {
        switch (field) {
            case 'hide':
            case 'hover_only':
            case 'respect_fog':
            case 'stroke_close':
            case 'use_grid_shapes':
                return typeof value !== 'boolean'
                    ? value === 'true'
                    : value;

            case 'angle':
            case 'direction':
            case 'fill_opacity':
            case 'radius':
            case 'stroke_opacity':
            case 'stroke_weight':
                return typeof value !== 'number'
                    ? Number(value)
                    : value;

            case 'fill_colour':
            case 'stroke_colour':
            case 'visibility':
            default:
                return value;
        }
    }
}
