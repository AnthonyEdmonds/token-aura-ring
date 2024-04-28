import { Aura } from "./Aura.js";
import { Form } from "./Form.js";

export class Config
{
    form = new Form();

    static timeout = 15;

    static windowId = 'token-aura-ring-config';

    static processChanges(simpleTokenDocument, changes)
    {
        if (simpleTokenDocument.isOwner !== true) {
            return;
        }

        for (const key in changes) {
            const change = changes[key];

            for (const property in change) {
                switch (property) {
                    case 'delete':
                        if (change[property] === 'yes') {
                            simpleTokenDocument.unsetFlag(Aura.namespace, key);
                        }
                        break;

                    case 'name':
                        if (change[property] !== key) {
                            const aura = simpleTokenDocument.getFlag(Aura.namespace, key);
                            simpleTokenDocument.unsetFlag(Aura.namespace, key);
                            simpleTokenDocument.setFlag(Aura.namespace, change[property], aura);
                        }
                        break;
                }
            }
        }
    }

    addAura(button)
    {
        const configWindow = document.getElementById(Config.windowId);
        
        let existingKeys = [];
        for (const child of configWindow.childNodes) {
            existingKeys.push(child.id.substr(5));
        }

        let key;
        let exists = true;
        let count = existingKeys.length;
        while (exists === true) {
            exists = false;
            key = `Aura ${count}`;
            
            for (const existingKey of existingKeys) {
                if (key === existingKey) {
                    exists = true;
                }
            }

            count++;
        }

        const section = this.configSection(key, Aura.defaultSettings(key));
        configWindow.insertBefore(section, configWindow.lastElementChild);
        this.resizeConfigForm(button);
    }

    colour(key, aura)
    {
        return this.form.group(
            'Colour',
            this.form.colour(key, aura, 'colour'),
        );
    }

    configSection(key, aura)
    {
        const group = document.createElement('div');
        group.id = this.form.id(key);

        group.append(
            this.name(key, aura),
            this.radius(key, aura),
            this.colour(key, aura),
            this.opacity(key, aura),
            this.weight(key, aura),
            this.visibility(key, aura),
            this.form.break(),
        );

        return group;
    }

    configTab()
    {
        const icon = this.form.icon('fa-ring');
        const text = document.createTextNode('Aura Ring');
        
        const link = document.createElement('a');
        link.classList.add('item');
        link.setAttribute('data-tab', Aura.namespace);
        link.append(icon, text);

        return link;
    }

    configWindow(simpleTokenDocument)
    {
        const configWindow = document.createElement('div');
        configWindow.classList.add('tab');
        configWindow.id = Config.windowId;
        configWindow.setAttribute('data-tab', Aura.namespace);

        let sections = [];
        const auras = simpleTokenDocument.flags[Aura.namespace];
        for (const key in auras) {
            sections.push(this.configSection(key, auras[key]));
        }

        const button = this.form.button(' Add a new aura', 'fa-plus');
        button.addEventListener('mouseup', this.addAura.bind(this, button));
        button.style.marginBottom = '0.5rem';

        configWindow.append(...sections, button);

        return configWindow;
    }

    markDelete(input)
    {
        input.value = "yes";

        this.resizeConfigForm(input);

        const configSection = input.parentElement.parentElement.parentElement
        configSection.style.height = 0;
        configSection.style.overflow = 'hidden';
    }

    name(key, aura)
    {
        const input = this.form.input(key, aura, 'name', 'text');
        input.value = key;

        const hidden = this.form.input(key, aura, 'delete', 'hidden');
        hidden.value = "no";

        const button = this.form.button(' Delete', 'fa-trash');

        button.addEventListener('mouseup', this.markDelete.bind(this, hidden));

        return this.form.group(
            'Name (must be unique)',
            this.form.fields(input, button, hidden),
        );
    }

    opacity(key, aura)
    {
        return this.form.group(
            'Opacity',
            this.form.range(key, aura, 'opacity'),
        );
    }

    radius(key, aura)
    {
        return this.form.group(
            'Radius (' + game.scenes.current.grid.units + ')',
            this.form.number(key, aura, 'radius'),
        );
    }

    resizeConfigForm(input)
    {
        const configForm = input.form.parentElement.parentElement;
        configForm.style.height = 'auto';
    }

    show(config)
    {
        config.position.width = 580;
        config.setPosition(config.position);

        const simpleTokenDocument = config.token;
        if (Aura.hasFlags(simpleTokenDocument) !== true) {
            simpleTokenDocument.setFlag(Aura.namespace, 'Aura', Aura.defaultSettings('Aura'));
        }

        const nav = config._tabs[0]._nav;
        nav.appendChild(this.configTab());

        const configWindow = this.configWindow(simpleTokenDocument);
        const content = config._tabs[0]._content;
        content.style.maxHeight = '75vh';
        content.insertBefore(
            configWindow,
            content.lastElementChild,
        );
    }

    visibility(key, aura)
    {
        return this.form.group(
            'Visibility',
            this.form.select(key, aura, 'visibility', Object.values(CONST.USER_ROLE_NAMES)),
        );
    }

    weight(key, aura)
    {
        return this.form.group(
            'Weight (px)',
            this.form.range(key, aura, 'weight', 16, 1, 1),
        );
    }
}
