import { AuraRingCanvas } from "./AuraRingCanvas.js";
import { AuraRingDataModel } from "./AuraRingDataModel.js"
import { AuraRingDirectory } from "./AuraRingDirectory.js";
import { AuraRingFlags } from "./AuraRingFlags.js";
import { AuraRing } from "./AuraRing.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

export class AuraRingSettings extends HandlebarsApplicationMixin(ApplicationV2)
{
    static DEFAULT_OPTIONS = {
        actions: {
            addAuraRing: AuraRingSettings.handleAddAuraRing,
            changeTab: AuraRingSettings.handleChangeTab,
            copyAuraRing: AuraRingSettings.handleCopy,
            deleteAuraRing: AuraRingSettings.handleDeleteAuraRing,
            duplicateAuraRing: AuraRingSettings.handleDuplicateAuraRing,
            openDirectory: AuraRingSettings.handleOpenDirectory,
            pasteAuraRing: AuraRingSettings.handlePaste,
            saveToDirectory: AuraRingSettings.handleSaveToDirectory,
            toggleHide: AuraRingSettings.handleToggleHide,
        },
        form: {
            handler: AuraRingSettings.handleForm,
            submitOnChange: false,
            closeOnSubmit: true,
        },
        id: `${AuraRing.namespace}-{id}`,
        position: {
            height: 640,
            width: 640,
        },
        tag: "form",
        window: {
            contentClasses: [
                'package-configuration',
            ],
            icon: 'fas fa-ring',
            minimizable: true,
            resizable: true,
            title: 'Aura Ring Configuration',
        },
    };

    static PARTS = {
        main: {
            template: 'modules/token-aura-ring/settings.html',
        },
    };

    auraRings = [];

    currentTab = 0;

    preview;

    // Getters
    /** @returns {AuraRing|null} */
    get clipboard()
    {
        return JSON.parse(
            sessionStorage.getItem(AuraRingCanvas.key),
        );
    }

    get title()
    {
        return `Aura Ring Configuration: ${this.preview.name}`;
    }

    // Setters
    /** @param {AuraRing} auraRing */
    set clipboard(auraRing)
    {
        sessionStorage.setItem(
            AuraRingCanvas.key, 
            JSON.stringify(auraRing),
        );
    }

    // Setup
    constructor(simpleTokenDocument, options = {}) {
        super(options);
        this.registerHooks();
        this.preview = simpleTokenDocument;
        this.auraRings = AuraRingFlags.getAuraRings(this.preview);
    }

    async close(options = {})
    {
        this.deregisterHooks();
        return super.close(options);
    }

    registerHooks()
    {
        Hooks.on(AuraRingFlags.hook, this.renderDirectory);
    }

    renderDirectory = () => {
        this.render();
    }

    deregisterHooks()
    {
        Hooks.off(AuraRingFlags.hook, this.renderDirectory);
    }

    _onChangeForm(context, event)
    {
        if (event.target.form !== null) {
            this.previewFormData(event.target.form);
        }
    }

    _onRender(context, options)
    {
        super._onRender(context, options);

        this.addEventListeners();
        this.changeTab(this.currentTab);
        this.previewFormData(this.element);
    }

    _prepareContext(options)
    {
        const auraRings = this.auraRings.sort(AuraRingSettings.sortAuraRings);
        if (this.currentTab === null && auraRings.length > 0) {
            this.currentTab = auraRings[0].id;
        }

        const dataModels = [];

        for (const auraRing of auraRings) {
            try {
                dataModels.push(new AuraRingDataModel(auraRing));
            } catch (error) {
                console.error('A malformed Aura Ring was detected; removing.');
                this.deleteAuraRing(auraRing.id);
            }
        }

        return {
            auraRings: dataModels,
            clipboardEmpty: this.clipboard === null,
        };
    }

    static register(config)
    {
        const formApplication = new AuraRingSettings(config._preview);
    
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

        config.form.children[2].insertBefore(
            formGroup,
            config.form.children[2].lastChild,
        );
        config.form.parentElement.parentElement.style.height = 'auto';
    }

    static sortAuraRings(first, second) {
        const firstName = first.name.toLowerCase();
        const secondName = second.name.toLowerCase();

        if (firstName < secondName) {
            return -1;
        }

        if (firstName > secondName) {
            return 1;
        }

        return 0;
    }

    // Handlers
    static async handleAddAuraRing()
    {
        this.addAuraRing();
    }

    static async handleChangeTab(event)
    {
        const auraId = parseInt(event.target.dataset.aura);
        this.changeTab(auraId);
    }

    static async handleCopy(event)
    {
        const auraId = parseInt(event.target.dataset.aura);
        this.copyAuraRing(auraId);
    }

    static async handleDeleteAuraRing(event)
    {
        const auraId = parseInt(event.target.dataset.aura);
        this.confirmDelete(auraId);
    }

    static async handleDuplicateAuraRing(event)
    {
        const auraId = parseInt(event.target.dataset.aura);
        this.duplicateAuraRing(auraId);
    }

    static async handleForm(event, form, formData)
    {
        AuraRingFlags.setAuraRings(
            this.preview, 
            this.gatherFormData(formData),
        );
    }

    static async handleOpenDirectory()
    {
        AuraRingDirectory.open(this.preview);
    }

    static async handlePaste()
    {
        this.pasteAuraRing();
    }

    static async handleRenameAuraRing(event)
    {
        const auraId = parseInt(event.target.dataset.aura);
        this.renameAuraRing(auraId, event.target.value);
    }

    static async handleSaveToDirectory(event)
    {
        const auraId = parseInt(event.target.dataset.aura);
        const auraRing = this.getAuraRing(auraId);
        AuraRingDirectory.put(auraRing);
    }

    static async handleToggleHide(event)
    {
        const auraId = parseInt(event.target.dataset.aura);
        this.toggleHideAuraRing(auraId);
    }

    // Aura Rings
    addAuraRing()
    {
        const id = AuraRingFlags.nextAvailableId(this.auraRings);

        this.auraRings.push({
            id: id,
            name: 'New Aura Ring',
        });

        this.currentTab = id;
        this.render();
    }

    /**
     * Create a clone of an Aura Ring without an ID
     * @param {number} id 
     * @returns {AuraRing}
     */
    cloneAuraRing(id)
    {
        const source = this.getAuraRing(id);
        const clone = foundry.utils.deepClone(source);
        clone.id = null;
        clone.name = `Copy of ${source.name}`;
        return clone;
    }

    /**
     * Copy an Aura Ring to the clipboard
     * @param {number} id 
     */
    copyAuraRing(id)
    {
        this.clipboard = this.cloneAuraRing(id);
        this.render();
    }

    deleteAuraRing(id)
    {
        this.auraRings.splice(
            this.getAuraRingIndex(id),
            1,
        );

        this.currentTab = null;
        this.render();
    }

    /**
     * Create a duplicate Aura Ring on this Token
     * @param {number} id 
     */
    duplicateAuraRing(id)
    {
        const clone = this.cloneAuraRing(id);
        clone.id = AuraRingFlags.nextAvailableId(this.auraRings);
        this.auraRings.push(clone);
        this.currentTab = clone.id;
        this.render();
    }

    getAuraRing(id)
    {
        for (const auraRing of this.auraRings) {
            if (auraRing.id === id) {
                return auraRing;
            }
        }

        return false;
    }

    getAuraRingIndex(id)
    {
        for (let index = 0; index < this.auraRings.length; ++index) {
            if (this.auraRings[index].id === id) {
                return index;
            }
        }

        return false;
    }

    /**
     * Paste an Aura Ring from the clipboard
     */
    pasteAuraRing()
    {
        const clone = this.clipboard;

        if (clone !== null) {
            clone.id = AuraRingFlags.nextAvailableId(this.auraRings);
            this.auraRings.push(clone);
            this.currentTab = clone.id;
            this.render();
        }
    }

    renameAuraRing(id, name)
    {
        const index = this.getAuraRingIndex(id);
        this.auraRings[index].name = name;
        this.render();
    }

    toggleHideAuraRing(id)
    {
        const index = this.getAuraRingIndex(id);
        this.auraRings[index].hide = !this.auraRings[index].hide;
        this.render();
    }

    // Dialogs
    confirmDelete(id)
    {
        const auraRing = this.getAuraRing(id);

        new foundry.applications.api.DialogV2({
            buttons: [
                {
                    action: 'cancel',
                    icon: 'fas fa-ban',
                    label: 'Cancel',
                },
                {
                    action: 'confirm',
                    callback: this.deleteAuraRing.bind(this, id),
                    icon: 'fas fa-trash',
                    label: 'Delete',
                },
            ],
            content: `
                <p>Are you sure you want to delete the Aura Ring "${auraRing.name}"?</p>
                <p><strong>This cannot be undone.</strong></p>
            `,
            window: {
                title: `Delete ${auraRing.name}`,
            },
        }).render(true);
    }

    // Window
    addEventListeners()
    {
        const inputs = document.querySelectorAll('[data-action="renameAuraRing"]');

        for (const input of inputs) {
            input.addEventListener(
                'change', 
                AuraRingSettings.handleRenameAuraRing.bind(this),
            );
        }
    }

    changeTab(target)
    {
        const articles = document.querySelectorAll('[data-group="auraRingArticles"]');
        const tabs = document.querySelectorAll('[data-group="auraRingTabs"]');
        
        const targetId = `${target}`;

        for (const article of articles) {
            if (article.dataset.aura === targetId) {
                article.classList.add('active');
                article.classList.remove('hidden');
            } else {
                article.classList.remove('active');
                article.classList.add('hidden');
            }
        }

        for (const tab of tabs) {
            tab.dataset.aura === targetId
                ? tab.classList.add('active')
                : tab.classList.remove('active');
        }

        this.currentTab = target;
    }

    gatherFormData(formData)
    {
        const data = {};
        const newAuraRings = [];

        for (const field in formData.object) {
            const index = field.indexOf('_');
            const id = parseInt(
                field.slice(0, index),
            );
            const key = field.slice(index + 1);
            const value = formData.object[field];

            if (data.hasOwnProperty(id) === false) {
                data[id] = {
                    id: id,
                };
            }

            data[id][key] = value;
        }

        for (const key in data) {
            newAuraRings.push(data[key]);
        }

        return newAuraRings;
    }

    previewFormData(form)
    {
        const formData = new foundry.applications.ux.FormDataExtended(form);
        const newAuraRings = this.gatherFormData(formData);

        for (let index = 0; index < newAuraRings.length; ++index) {
            this.auraRings[index] = newAuraRings[index];
        }

        AuraRingCanvas.handleRefreshToken(this.preview.object);
    }
}
