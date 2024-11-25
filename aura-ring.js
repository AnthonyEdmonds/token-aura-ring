import { AuraRingCanvas } from './AuraRingCanvas.js';
import { AuraRingFormApplication } from './AuraRingFormApplication.js';
import { AuraRingApi } from './AuraRingApi.js';

Hooks.on('renderTokenConfig', function (config) {
    const formApplication = new AuraRingFormApplication(config.preview);
    
    const icon = document.createElement('i');
    icon.classList.add('fas', 'fa-ring');

    const text = document.createTextNode(' Configure Token Aura Rings');

    const button = document.createElement('button');
    button.append(icon, text);
    button.style.whiteSpace = 'nowrap';
    button.type = 'button';
    button.addEventListener('click', formApplication.render.bind(formApplication, true));

    const formGroup = document.createElement('div');
    formGroup.classList.add('form-group');
    formGroup.append(button);

    config.form.children[1].appendChild(formGroup);
    config.form.parentElement.parentElement.style.height = 'auto';
});

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
    Hooks.on('sightRefresh', AuraRingCanvas.handleSightRefresh);

    // Fired on: updated (for client)
    Hooks.on('updateToken', AuraRingCanvas.handleUpdateToken);
});

/**
 * Add the AuraRingApi to the window
 */
Hooks.on('init', function () {
    globalThis.TokenAuraRing = AuraRingApi;
});
