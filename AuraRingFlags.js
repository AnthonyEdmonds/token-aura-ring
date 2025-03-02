import { AuraRing } from "./AuraRing.js";
import { AuraRingDataModel } from "./AuraRingDataModel.js";

export class AuraRingFlags
{
    static hook = 'flags-updated';

    // Flags

    /**
     * Get the AuraRings proxy from a token document
     * @param {TokenDocument} tokenDocument 
     * @returns {AuraRing[]}
     */
    static getAuraRings(tokenDocument)
    {
        if (AuraRingFlags.hasAuraRings(tokenDocument) === false) {
            AuraRingFlags.setAuraRings(tokenDocument, []);
            return [];
        }

        return tokenDocument.getFlag(AuraRing.namespace, AuraRing.key);
    }

    /**
     * Determine whether a Token has any Aura Rings set
     * @param {TokenDocument} tokenDocument 
     * @returns {boolean}
     */
    static hasAuraRings(tokenDocument)
    {
        if (tokenDocument.flags.hasOwnProperty(AuraRing.namespace) === false) {
            return false;
        }

        return tokenDocument.flags[AuraRing.namespace].hasOwnProperty(AuraRing.key) === true;
    }

    /**
     * Set the TokenDocument's Aura Ring Flag
     * @param {TokenDocument} tokenDocument 
     * @param {AuraRing[]} auraRings 
     * @param {boolean} directly Whether to set the flag directly, to avoid re-rendering
     */
    static setAuraRings(tokenDocument, auraRings, directly = false)
    {
        directly === true
            ? tokenDocument.flags[AuraRing.namespace][AuraRing.key] = auraRings
            : tokenDocument.setFlag(AuraRing.namespace, AuraRing.key, auraRings);

        Hooks.call(AuraRingFlags.hook);
    }

    // Auras
    static nextAvailableId(auraRings)
    {
        let potentialId = 0;
        const usedIds = [];

        for (const auraRing of auraRings) {
            usedIds.push(auraRing.id);
        }

        while (potentialId < 100) {
            if (usedIds.includes(potentialId) === false) {
                return potentialId;
            }

            potentialId++;
        }
    }

    // Migration
    static migrateData(tokenDocument)
    {
        if (AuraRingFlags.needsMigration(tokenDocument) === false) {
           return;
        }

        const auraRings = AuraRingFlags.getAuraRings(tokenDocument);

        for (const key in tokenDocument.flags[AuraRing.namespace]) {
            if (key === AuraRing.key) {
                continue;
            }

            const oldAuraRing = tokenDocument.getFlag(AuraRing.namespace, key);
            const newAuraRing = AuraRingFlags.migrateFromV1(
                oldAuraRing,
                AuraRingFlags.nextAvailableId(auraRings),
                key,
            );

            auraRings.push(newAuraRing);
            tokenDocument.unsetFlag(AuraRing.namespace, key);
        }

        AuraRingFlags.setAuraRings(tokenDocument, auraRings);
    }

    static migrateFromV1(oldAuraRing, newId, name)
    {
        const newAuraRing = AuraRingDataModel.defaultSettings();

        newAuraRing.id = newId;
        newAuraRing.name = name;

        AuraRingFlags.migrateField(oldAuraRing, 'angle', newAuraRing, 'angle');
        AuraRingFlags.migrateField(oldAuraRing, 'direction', newAuraRing, 'direction');
        AuraRingFlags.migrateField(oldAuraRing, 'radius', newAuraRing, 'radius');
        AuraRingFlags.migrateField(oldAuraRing, 'colour', newAuraRing, 'stroke_colour');
        AuraRingFlags.migrateField(oldAuraRing, 'opacity', newAuraRing, 'stroke_opacity');
        AuraRingFlags.migrateField(oldAuraRing, 'weight', newAuraRing, 'stroke_weight');
        AuraRingFlags.migrateField(oldAuraRing, 'visibility', newAuraRing, 'visibility');

        return newAuraRing;
    }

    static needsMigration(tokenDocument)
    {
        if (tokenDocument.flags.hasOwnProperty(AuraRing.namespace) === false) {
            return false;
        }

        for (const key in tokenDocument.flags[AuraRing.namespace]) {
            if (key !== AuraRing.key) {
                return true;
            }
        }

        return false;
    }

    static migrateField(source, sourceKey, target, targetKey)
    {
        if (source.hasOwnProperty(sourceKey) === true) {
            target[targetKey] = source[sourceKey];
        }
    }
}
