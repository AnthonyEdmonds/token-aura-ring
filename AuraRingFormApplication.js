import { AuraRingCanvas } from "./AuraRingCanvas.js";
import { AuraRingDataModel } from "./AuraRingDataModel.js"
import { AuraRingFlags } from "./AuraRingFlags.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

export class AuraRingFormApplication extends HandlebarsApplicationMixin(ApplicationV2)
{
    static DEFAULT_OPTIONS = {
        actions: {
            addAuraRing: AuraRingFormApplication.handleAddAuraRing,
            changeTab: AuraRingFormApplication.handleChangeTab,
            deleteAuraRing: AuraRingFormApplication.handleDeleteAuraRing,
            duplicateAuraRing: AuraRingFormApplication.handleDuplicateAuraRing,
        },
        form: {
            handler: AuraRingFormApplication.handleForm,
            submitOnChange: false, // Could be useful for live updates?
            closeOnSubmit: true,
        },
        id: `${AuraRingFlags.namespace}-{id}`,
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

    currentTab = null;

    preview;

    // Getters
    get title()
    {
        return `Aura Ring Configuration: ${this.preview.name}`;
    }

    // Setup
    constructor(simpleTokenDocument, options={}) {
        super(options);
        this.preview = simpleTokenDocument;
        this.auraRings = AuraRingFlags.getAuraRings(this.preview);
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
        const auraRings = this.auraRings.sort(this.sortAuraRings);
        if (this.currentTab === null && auraRings.length > 0) {
            this.currentTab = auraRings[0].id;
        }

        const dataModels = [];
        for (const auraRing of auraRings) {
            dataModels.push(new AuraRingDataModel(auraRing));
        }

        return {
            auraRings: dataModels,
        };
    }

    // Handlers
    static async handleAddAuraRing(event, target)
    {
        this.addAuraRing();
    }

    static async handleChangeTab(event, target)
    {
        this.changeTab(target.dataset.tab);
    }

    static async handleDeleteAuraRing(event, target)
    {
        this.confirmDelete(target.dataset.aura);
    }

    static async handleDuplicateAuraRing(event, target)
    {
        this.duplicateAuraRing(target.dataset.aura);
    }

    static async handleForm(event, form, formData)
    {
        AuraRingFlags.setAuraRings(
            this.preview, 
            this.gatherFormData(formData),
        );
    }

    static async handleRenameAuraRing(event)
    {
        this.renameAuraRing(event.target.dataset.aura, event.target.value);
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

    deleteAuraRing(id)
    {
        this.auraRings.splice(
            this.getAuraRingIndex(id),
            1,
        );

        this.currentTab = null;
        this.render();
    }

    duplicateAuraRing(id)
    {
        const source = this.getAuraRing(id);
        const clone = deepClone(source);

        clone.id = AuraRingFlags.nextAvailableId(this.auraRings);
        clone.name = `Copy of ${source.name}`;
        this.auraRings.push(clone);

        this.currentTab = clone.id;
        this.render();
    }

    getAuraRing(id)
    {
        if (typeof id === 'number') {
            id = `${id}`;
        }

        for (const auraRing of this.auraRings) {
            if (auraRing.id === id) {
                return auraRing;
            }
        }

        return false;
    }

    getAuraRingIndex(id)
    {
        if (typeof id === 'number') {
            id = `${id}`;
        }

        for (const index in this.auraRings) {
            if (this.auraRings[index].id === id) {
                return index;
            }
        }

        return false;
    }

    renameAuraRing(id, name)
    {
        const index = this.getAuraRingIndex(id);
        this.auraRings[index].name = name;
        this.render();
    }

    sortAuraRings (first, second) {
        if (first.name < second.name) {
            return -1;
        }

        if (first.name > second.name) {
            return 1;
        }

        return 0;
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
                AuraRingFormApplication.handleRenameAuraRing.bind(this),
            );
        }
    }

    changeTab(target)
    {
        const tabs = document.querySelectorAll('[data-group="auraRingTabs"]');

        if (typeof target !== 'string') {
            target = `${target}`;
        }

        for (const tab of tabs) {
            tab.dataset.tab === target
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
            const id = field.slice(0, index);
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
        const formData = new FormDataExtended(form);
        const newAuraRings = this.gatherFormData(formData);

        for (const index in newAuraRings) {
            this.auraRings[index] = newAuraRings[index];
        }

        AuraRingCanvas.handleRefreshToken(this.preview.object);
    }
}
