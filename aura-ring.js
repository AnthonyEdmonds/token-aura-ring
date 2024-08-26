import { AuraRing } from './AuraRing.js';
import { AuraRingFormApplication } from './AuraRingFormApplication.js';

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

    // TODO Token breaks when config is open, but works once closed.
});

Hooks.on('initializeVisionSources', AuraRing.setup);

// TODO Attempt migration of auras.
// TODO May be missing some update states when redrawing / rotating
// TODO Update preview of token
