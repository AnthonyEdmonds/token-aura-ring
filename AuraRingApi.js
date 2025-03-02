import { AuraRingDataModel } from "./AuraRingDataModel.js";
import { AuraRingDirectory } from "./AuraRingDirectory.js";
import { AuraRingFlags } from "./AuraRingFlags.js";
import { AuraRing } from "./AuraRing.js";

export class AuraRingApi
{
    /**
     * Retrieve all Aura Rings
     * 
     * @param {TokenDocument} tokenDocument
     * 
     * @returns {AuraRing[]}
     */
    static all(tokenDocument)
    {
        return AuraRingFlags.getAuraRings(tokenDocument);
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
     * @param {TokenDocument} tokenDocument
     * @param {number} id
     */
    static delete(tokenDocument, id)
    {
        const auraRings = AuraRingFlags.getAuraRings(tokenDocument);
        const index = AuraRingApi.getAuraRingIndex(auraRings, id);

        if (index !== false) {
            auraRings.splice(index, 1);
            AuraRingFlags.setAuraRings(tokenDocument, auraRings);
        }
    }

    /**
     * Remove all Aura Rings
     * 
     * @param {TokenDocument} tokenDocument
     */
    static deleteAll(tokenDocument)
    {
        AuraRingFlags.setAuraRings(tokenDocument, []);
    }

    /**
     * Open the Aura Ring Directory
     * 
     * @param {TokenDocument|null} tokenDocument
     */
    static directory(tokenDocument = null)
    {
        AuraRingDirectory.open(tokenDocument);
    }

    /**
     * Retrieve a specific Aura Ring
     * 
     * @param {TokenDocument} tokenDocument
     * @param {number|string} term
     * @param {string} field
     * 
     * @returns {AuraRing|false}
     */
    static get(tokenDocument, term, field = 'id')
    {
        const auraRings = AuraRingFlags.getAuraRings(tokenDocument);

        return AuraRingApi.getAuraRing(auraRings, term, field);
    }

    /**
     * Retrieve an Aura Ring by any field
     * 
     * @param {AuraRing[]} auraRings 
     * @param {number|string} term
     * @param {string} field
     * @returns {AuraRing|false}
     */
    static getAuraRing(auraRings, term, field = 'id')
    {
        for (const auraRing of auraRings) {
            if (auraRing[field] == term) {
                return auraRing;
            }
        }

        return false;
    }

    /**
     * Retrieve the index of an Aura Ring by any field
     * 
     * @param {AuraRing[]} auraRings 
     * @param {number|string} term
     * @param {string} field
     * @returns {AuraRing|false}
     */
    static getAuraRingIndex(auraRings, term, field = 'id')
    {
        for (let index = 0; index < auraRings.length; ++index) {
            if (auraRings[index][field] == term) {
                return index;
            }
        }

        return false;
    }

    /**
     * Retrieve a list of Aura Ring names keyed by their ID
     * 
     * @param {TokenDocument} tokenDocument
     * 
     * @returns {Object}
     */
    static index(tokenDocument)
    {
        const auraRings = AuraRingFlags.getAuraRings(tokenDocument);
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
     * @param {TokenDocument} tokenDocument
     * 
     * @returns {AuraRing} As given, but with the new ID
     */
    static new(tokenDocument)
    {
        const auraRings = AuraRingFlags.getAuraRings(tokenDocument);
        const auraRing = AuraRingDataModel.defaultSettings();

        auraRing.id = AuraRingFlags.nextAvailableId(auraRings);
        auraRings.push(auraRing);
        AuraRingFlags.setAuraRings(tokenDocument, auraRings);

        return auraRing;
    }

    /**
     * Add or overwrite an Aura Ring
     * 
     * @param {TokenDocument} tokenDocument 
     * @param {AuraRing} auraRing
     */
    static set(tokenDocument, auraRing)
    {
        const isPreview = tokenDocument.object.hasPreview === true;

        if (isPreview === true) {
            tokenDocument = tokenDocument.object._preview.document;
        }

        const auraRings = AuraRingFlags.getAuraRings(tokenDocument);

        if (auraRing.id === null) {
            auraRing.id = AuraRingFlags.nextAvailableId(auraRings);
        } else {
            const index = AuraRingApi.getAuraRingIndex(auraRings, auraRing.id);

            index !== false
                ? auraRings.splice(index, 1)
                : auraRing.id = AuraRingFlags.nextAvailableId(auraRings);
        }

        auraRings.push(auraRing);
        AuraRingFlags.setAuraRings(tokenDocument, auraRings, isPreview);
    }

    /**
     * Overwrite all Aura Rings with a new set
     * 
     * @param {TokenDocument} tokenDocument 
     * @param {AuraRing[]} auraRings 
     */
    static setAll(tokenDocument, auraRings)
    {
        AuraRingFlags.setAuraRings(tokenDocument, auraRings);
    }

    /**
     * Update a specific Aura Ring value directly
     * 
     * @param {TokenDocument} tokenDocument 
     * @param {number} id 
     * @param {string} key 
     * @param {number|string|boolean} value 
     */
    static setValue(tokenDocument, id, key, value)
    {
        const auraRings = AuraRingFlags.getAuraRings(tokenDocument);
        const index = this.getAuraRingIndex(auraRings, id);
        auraRings[index][key] = value;
        AuraRingFlags.setAuraRings(tokenDocument, auraRings);
    }
}
