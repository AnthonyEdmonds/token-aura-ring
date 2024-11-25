import { AuraRingDataModel } from "./AuraRingDataModel";
import { AuraRingFlags } from "./AuraRingFlags";

export class AuraRingApi
{
    /**
     * A Token Aura Ring
     * @typedef  {Object}   AuraRing
     * @property {number}   angle               How wide the Aura Ring should be, from 5 to 360 degrees
     * @property {number}   direction           Which way the Aura Ring should face, from -180 to 180 degrees
     * @property {string}   fill_colour         The fill colour in hex
     * @property {number}   fill_opacity        The fill opacity as a fraction between 0 and 1
     * @property {number}   id                  The unique numeric identifier of the Aura Ring
     * @property {string}   name                The display name of the Aura Ring
     * @property {number}   radius              The radius of the Aura Ring, from 0
     * @property {boolean}  stroke_close        Whether to stroke the complete outline of the Aura Ring
     * @property {string}   stroke_colour       The stroke colour in hex
     * @property {number}   stroke_opacity      The stroke opacity as a fraction between 0 and 1
     * @property {number}   stroke_weight       The stroke weight in pixels, from 0
     * @property {boolean}  use_grid_shapes     Whether to use grid shapes, if enabled
     * @property {string}   visibility          Which user roles can see the Aura Ring
     */

    /**
     * Retrieve all Aura Rings
     * 
     * @param {SimpleTokenDocument} simpleTokenDocument
     * 
     * @returns {Array[AuraRing]}
     */
    static all(simpleTokenDocument)
    {
        return AuraRingFlags.getAuraRings(simpleTokenDocument);
    }

    /**
     * Get an unsaved empty Aura Ring without an ID
     * 
     * @returns {AuraRing}
     */
    static blank()
    {
        return AuraRingDataModel.defaultSettings();
    }

    /**
     * Remove an Aura Ring
     * 
     * @param {SimpleTokenDocument*} simpleTokenDocument
     * @param {number} id
     */
    static delete(simpleTokenDocument, id)
    {
        const auraRings = AuraRingFlags.getAuraRings(simpleTokenDocument);
        const index = AuraRingApi.getAuraRingIndex(id);

        if (index !== false) {
            auraRings.splice(index, 1);
            AuraRingFlags.setAuraRings(simpleTokenDocument, auraRings);
        }
    }

    /**
     * Remove all Aura Rings
     * 
     * @param {SimpleTokenDocument} simpleTokenDocument
     */
    static deleteAll(simpleTokenDocument)
    {
        AuraRingFlags.setAuraRings(simpleTokenDocument, []);
    }

    /**
     * Retrieve a specific Aura Ring
     * 
     * @param {SimpleTokenDocument} simpleTokenDocument
     * @param {number} id
     * 
     * @returns {AuraRing|false}
     */
    static get(simpleTokenDocument, id)
    {
        const auraRings = AuraRingFlags.getAuraRings(simpleTokenDocument);

        return AuraRingApi.getAuraRing(auraRings, id);
    }

    /**
     * Retrieve a list of Aura Ring names keyed by their ID
     * 
     * @param {SimpleTokenDocument} simpleTokenDocument
     * 
     * @returns {Object}
     */
    static index(simpleTokenDocument)
    {
        const auraRings = AuraRingFlags.getAuraRings(simpleTokenDocument);
        const index = {};

        for (const auraRing of auraRings) {
            index[auraRing.id] = auraRing.name;
        }

        return index;
    }

    /**
     * Create a new Aura Ring from the default settings
     * The ID of the Aura Ring will be set to the next available
     * 
     * @param {SimpleTokenDocument} simpleTokenDocument
     * 
     * @returns {AuraRing} As given, but with the new ID
     */
    static new(simpleTokenDocument)
    {
        const auraRings = AuraRingFlags.getAuraRings(simpleTokenDocument);
        const auraRing = AuraRingDataModel.defaultSettings();

        auraRing.id = AuraRingFlags.nextAvailableId(auraRings);
        auraRings.push(auraRing);
        AuraRingFlags.setAuraRings(simpleTokenDocument, auraRings);

        return auraRing;
    }

    /**
     * Overwrite an Aura Ring with new settings
     * 
     * @param {SimpleTokenDocument} simpleTokenDocument 
     * @param {AuraRing} auraRing
     */
    static set(simpleTokenDocument, auraRing)
    {
        const auraRings = AuraRingFlags.getAuraRings(simpleTokenDocument);
        const index = AuraRingApi.getAuraRingIndex(auraRings, auraRing.id);

        if (index !== false) {
            auraRings.splice(index, 1);
        }

        auraRings.push(auraRing);
        AuraRingFlags.setAuraRings(simpleTokenDocument, auraRings);
    }

    /**
     * Overwrite all Aura Rings with a new set
     * 
     * @param {SimpleTokenDocument} simpleTokenDocument 
     * @param {Array[AuraRing]} auraRings 
     */
    static setAll(simpleTokenDocument, auraRings)
    {
        AuraRingFlags.setAuraRings(simpleTokenDocument, auraRings);
    }

    /**
     * Update a specific Aura Ring value directly
     * 
     * @param {SimpleTokenDocument} simpleTokenDocument 
     * @param {number} id 
     * @param {string} key 
     * @param {number|string|boolean} value 
     */
    static setValue(simpleTokenDocument, id, key, value)
    {
        const auraRings = AuraRingFlags.getAuraRings(simpleTokenDocument);
        const index = this.getAuraRingIndex(auraRings, id);
        auraRings[index][key] = value;
        AuraRingFlags.setAuraRings(simpleTokenDocument, auraRings);
    }

    static getAuraRing(auraRings, id)
    {
        if (typeof id === 'number') {
            id = `${id}`;
        }

        for (const auraRing of auraRings) {
            if (auraRing.id === id) {
                return auraRing;
            }
        }

        return false;
    }

    static getAuraRingIndex(auraRings, id)
    {
        if (typeof id === 'number') {
            id = `${id}`;
        }

        for (const index in auraRings) {
            if (auraRings[index].id === id) {
                return index;
            }
        }

        return false;
    }
}
