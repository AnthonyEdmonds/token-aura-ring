import { AuraRingDataModel } from "./AuraRingDataModel.js";

export class AuraRingFlags
{
    static auraRingsKey = 'aura-rings';

    static namespace = 'token-aura-ring';

    // Flags
    static getAuraRings(simpleTokenDocument)
    {
        if (AuraRingFlags.hasAuraRings(simpleTokenDocument) === false) {
            AuraRingFlags.setAuraRings(simpleTokenDocument, []);
        }

        return simpleTokenDocument.getFlag(AuraRingFlags.namespace, AuraRingFlags.auraRingsKey);
    }

    static hasAuraRings(simpleTokenDocument)
    {
        if (simpleTokenDocument.flags.hasOwnProperty(AuraRingFlags.namespace) === false) {
            return false;
        }

        return simpleTokenDocument.flags[AuraRingFlags.namespace].hasOwnProperty(AuraRingFlags.auraRingsKey) === true;
    }

    static setAuraRings(simpleTokenDocument, auraRings)
    {
        simpleTokenDocument.setFlag(AuraRingFlags.namespace, AuraRingFlags.auraRingsKey, auraRings);
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
            if (usedIds.includes(`${potentialId}`) === false) {
                return potentialId;
            }

            potentialId++;
        }
    }

    // Migration
    static migrateData(simpleTokenDocument)
    {
        if (AuraRingFlags.needsMigration(simpleTokenDocument) === false) {
           return;
        }

        const auraRings = AuraRingFlags.getAuraRings(simpleTokenDocument);

        for (const key in simpleTokenDocument.flags[AuraRingFlags.namespace]) {
            if (key === AuraRingFlags.auraRingsKey) {
                continue;
            }

            const oldAuraRing = simpleTokenDocument.getFlag(AuraRingFlags.namespace, key);
            const newAuraRing = AuraRingFlags.migrateFromV1(
                oldAuraRing,
                AuraRingFlags.nextAvailableId(auraRings),
                key,
            );

            auraRings.push(newAuraRing);
            simpleTokenDocument.unsetFlag(AuraRingFlags.namespace, key);
        }

        AuraRingFlags.setAuraRings(simpleTokenDocument, auraRings);
    }

    static migrateFromV1(oldAuraRing, newId, name)
    {
        const newAuraRing = AuraRingDataModel.defaultSettings();

        newAuraRing.id = `${newId}`;
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

    static needsMigration(simpleTokenDocument)
    {
        if (simpleTokenDocument.flags.hasOwnProperty(AuraRingFlags.namespace) === false) {
            return false;
        }

        for (const key in simpleTokenDocument.flags[AuraRingFlags.namespace]) {
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
