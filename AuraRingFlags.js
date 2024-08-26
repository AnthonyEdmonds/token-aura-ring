export class AuraRingFlags
{
    static auraRingsKey = 'aura-rings';

    static namespace = 'token-aura-ring';

    static getAuraRings(simpleTokenDocument)
    {
        if (AuraRingFlags.hasAuraRings(simpleTokenDocument) === false) {
            return [];
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
}
