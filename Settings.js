import { Aura } from "./Aura.js";
import { AuraRing } from "./AuraRing.js"

export class Settings extends FormApplication
{
    config;

    constructor(config)
    {
        super();
        this.config = config;
        console.log(this);
        /*
         * const simpleTokenDocument = config.token;
         * Has access to actor, token, preview
         * Edit preview, then when saved apply to token?
        */
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['form'],
            id: 'token-aura-ring',
            minimizable: true,
            popOut: true,
            resizable: true,
            template: `modules/token-aura-ring/settings.html`,
            title: 'Token Aura Ring settings', // TODO Actor name
            width: 720,
        });
    }

    getData() {
        return {
            auras: Aura.getAuras(this.config.token),
            form: AuraRing.defineSchema(),
        };
    }

    // TODO Update PreviewToken object

    async _updateObject(event, formData) {
        console.log(formData);
        // TODO Accept FormData and apply to token
    }

    static addSettingsButtonToConfig(config)
    {
        console.log(config);
        const settings = new Settings(config);
        // Testing
        settings.render(true);

        /*
        const icon = document.createElement('i');
        icon.classList.add('fas', 'fa-ring');

        const text = document.createTextNode(' Configure Token Aura Rings');

        const button = document.createElement('button');
        button.append(icon, text);
        button.style.whiteSpace = 'nowrap';
        button.type = 'button';
        button.addEventListener('click', settings.render.bind(settings, true));

        const formGroup = document.createElement('div');
        formGroup.classList.add('form-group');
        formGroup.append(button);

        config.form.children[2].appendChild(formGroup);
        */
    }
}
