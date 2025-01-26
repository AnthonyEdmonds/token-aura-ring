import { AuraRingCanvas } from './AuraRingCanvas.js';
import { AuraRingSettings } from './AuraRingSettings.js';
import { AuraRingApi } from './AuraRingApi.js';
import { AuraRingDirectory } from './AuraRingDirectory.js';

Hooks.on('renderTokenConfig', AuraRingSettings.register);

/**
 * Auras can only be drawn once vision has been established
 * Tokens are completely removed and redrawn when updated, moved, etc.
 */
Hooks.on('initializeVisionSources', function () {
    AuraRingCanvas.makePixiAurasContainer();
    
    // Fired on: deleted, updated
    Hooks.on('destroyToken', AuraRingCanvas.handleDestroyToken);

    // Fired on: created, hovered, moved, rotated, selected, updated
    Hooks.on('refreshToken', AuraRingCanvas.handleRefreshToken);

    // Fired on: deleted, moved, selected, updated
    // Hooks.on('sightRefresh', AuraRingCanvas.handleSightRefresh);

    // Fired on: updated (for client)
    Hooks.on('updateToken', AuraRingCanvas.handleUpdateToken);
});

/**
 * Add the AuraRingApi to the window
 */
Hooks.on('init', function () {
    AuraRingDirectory.register();
    globalThis.TokenAuraRing = AuraRingApi;
});
