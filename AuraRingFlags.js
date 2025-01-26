import { AuraRingDataModel } from "./AuraRingDataModel.js";

export class AuraRingFlags
{
    static auraRingsKey = 'aura-rings';

    static hook = 'flags-updated';

    static namespace = 'token-aura-ring';

    // Flags
    static getAuraRings(tokenDocument)
    {
        if (AuraRingFlags.hasAuraRings(tokenDocument) === false) {
            AuraRingFlags.setAuraRings(tokenDocument, []);
            return [];
        }

        return tokenDocument.getFlag(AuraRingFlags.namespace, AuraRingFlags.auraRingsKey);
    }

    static hasAuraRings(tokenDocument)
    {
        if (tokenDocument.flags.hasOwnProperty(AuraRingFlags.namespace) === false) {
            return false;
        }

        return tokenDocument.flags[AuraRingFlags.namespace].hasOwnProperty(AuraRingFlags.auraRingsKey) === true;
    }

    /**
     * Set the TokenDocument's Aura Ring Flag
     * @param {TokenDocument} tokenDocument 
     * @param {AuraRing} auraRings 
     * @param {boolean} directly Whether to set the flag directly, to avoid re-rendering
     */
    static setAuraRings(tokenDocument, auraRings, directly = false)
    {
        directly === true
            ? tokenDocument.flags[AuraRingFlags.namespace][AuraRingFlags.auraRingsKey] = auraRings
            : tokenDocument.setFlag(AuraRingFlags.namespace, AuraRingFlags.auraRingsKey, auraRings);

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

        for (const key in tokenDocument.flags[AuraRingFlags.namespace]) {
            if (key === AuraRingFlags.auraRingsKey) {
                continue;
            }

            const oldAuraRing = tokenDocument.getFlag(AuraRingFlags.namespace, key);
            const newAuraRing = AuraRingFlags.migrateFromV1(
                oldAuraRing,
                AuraRingFlags.nextAvailableId(auraRings),
                key,
            );

            auraRings.push(newAuraRing);
            tokenDocument.unsetFlag(AuraRingFlags.namespace, key);
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
        if (tokenDocument.flags.hasOwnProperty(AuraRingFlags.namespace) === false) {
            return false;
        }

        for (const key in tokenDocument.flags[AuraRingFlags.namespace]) {
            if (key !== AuraRingFlags.auraRingsKey) {
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
