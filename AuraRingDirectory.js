import { AuraRingApi } from "./AuraRingApi.js";
import { AuraRingFlags } from "./AuraRingFlags.js";
import { AuraRingSettings } from "./AuraRingSettings.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

export class AuraRingDirectory extends HandlebarsApplicationMixin(ApplicationV2)
{
    static DEFAULT_OPTIONS = {
        actions: {
            add: AuraRingDirectory.handleAdd,
            changeToken: AuraRingDirectory.handleChangeToken,
            remove: AuraRingDirectory.handleRemove,
            rename: AuraRingDirectory.handleRename,
        },
        form: {
            submitOnChange: false,
            closeOnSubmit: false,
        },
        id: `${AuraRingFlags.namespace}-${AuraRingDirectory.name}`,
        position: {
            height: 640,
            width: 320,
        },
        tag: "form",
        window: {
            icon: 'fas fa-ring',
            minimizable: true,
            resizable: true,
            title: 'Aura Ring Directory',
        },
    };

    static PARTS = {
        main: {
            template: 'modules/token-aura-ring/directory.html',
        },
    };

    static name = 'directory';

    static hook = 'directory-update';

    selectedTokenId = null;

    // Setup
    constructor(tokenDocument = null, options={}) {
        super(options);

        this.registerHooks();
        this.selectedTokenId = tokenDocument?.id ?? null;
    }

    async close(options = {})
    {
        this.deregisterHooks();
        return super.close(options);
    }

    registerHooks()
    {
        Hooks.on('createToken', this.renderDirectory);
        Hooks.on('destroyToken', this.renderDirectory);
        Hooks.on(AuraRingDirectory.hook, this.renderDirectory);
    }

    renderDirectory = () => {
        this.render();
    }

    deregisterHooks()
    {
        Hooks.off('createToken', this.renderDirectory);
        Hooks.off('destroyToken', this.renderDirectory);
        Hooks.off(AuraRingDirectory.hook, this.renderDirectory);
    }

    _onRender(context, options)
    {
        super._onRender(context, options);

        this.addEventListeners();
    }

    _prepareContext()
    {
        const tokenDocuments = game.scenes.current.tokens.contents;
        const tokens = [];

        for (let index = 0; index < tokenDocuments.length; ++index) {
            const token = tokenDocuments[index];

            if (token.isOwner === false) {
                continue;
            }

            tokens.push({
                id: token.id,
                name: token.name,
                selected: token.id === this.selectedTokenId,
            })
        }

        tokens.sort(AuraRingSettings.sortAuraRings);

        return {
            auraRings: AuraRingDirectory.all(),
            hasTokens: tokens.length > 0,
            noTokenSelected: this.selectedTokenId === null,
            tokens: tokens,
        };
    }

    static register() 
    {
        game.settings.register(AuraRingFlags.namespace, AuraRingDirectory.name, {
            name: 'Test',
            scope: 'world',
            config: false,
            type: Array,
            default: [],
            onChange: function () {
                Hooks.call(AuraRingDirectory.hook);
            },
        });

        game.settings.registerMenu(AuraRingFlags.namespace, 'open-directory', {
            name: "Aura Ring Directory",
            label: "Open...",
            hint: "Open the Aura Ring Directory to apply and manage your stored Aura Rings.",
            icon: "fas fa-folder-open",
            type: AuraRingDirectory,
        });
    }

    // Handlers
    static async handleAdd(event)
    {
        const auraName = event.target.dataset.aura;
        const tokenId = event.target.form.elements.token?.value ?? '';

        if (tokenId === '') {
            return;
        }

        AuraRingDirectory.add(auraName, tokenId);
    }

    static async handleChangeToken(event)
    {
        this.selectedTokenId =  event.target.value;
    }

    static async handleRemove(event)
    {
        AuraRingDirectory.remove(event.target.dataset.aura);
    }

    static async handleRename(event)
    {
        await AuraRingDirectory.rename(event.target.dataset.aura);
    }

    // Window
    addEventListeners()
    {
        document
            .getElementById('tokenAuraRingDirectoryTokenSelector')
            .addEventListener(
                'change', 
                AuraRingDirectory.handleChangeToken.bind(this),
            );
    }

    // Settings

    /**
     * Add an Aura Ring to a specific Token in the current scene
     * @param {string} auraName 
     * @param {string} tokenId 
     */
    static add(auraName, tokenId)
    {
        const auraRing = AuraRingDirectory.get(auraName);
        const tokenDocument = game.scenes.current.tokens.get(tokenId);

        AuraRingApi.set(tokenDocument, auraRing);
    }

    /**
     * Get all Aura Rings stored in the directory
     * @returns {AuraRing[]}
     */
    static all()
    {
        return game.settings.get(AuraRingFlags.namespace, AuraRingDirectory.name);
    }

    /**
     * Get an Aura Ring stored in the directory
     * @param {string} name
     * @returns {AuraRing|false}
     */
    static get(name)
    {
        let auraRing =  AuraRingApi.getAuraRing(
            AuraRingDirectory.all(),
            name,
            'name',
        );

        auraRing = foundry.utils.deepClone(auraRing);
        auraRing.id = null;

        return auraRing;
    }

    /**
     * Check whether an Aura Ring exists in the directory
     * @param {string} name 
     * @returns {boolean}
     */
    static has(name)
    {
        return AuraRingDirectory.get(name) !== false;
    }

    /** 
     * Open the Aura Ring Directory
     * @param {TokenDocument|null} tokenDocument
     */
    static open(tokenDocument = null)
    {
        const directory = new AuraRingDirectory(tokenDocument);
        directory.render(true);
    }

    /**
     * Add an Aura Ring to the directory
     * @param {AuraRing} auraRing
     * @param {string|null} newName
     */
    static async put(auraRing, newName = null)
    {
        auraRing = foundry.utils.deepClone(auraRing);
        auraRing.id = null;

        if (newName !== null) {
            auraRing.name = newName;
        }

        if (AuraRingDirectory.has(auraRing.name) === true) {
            auraRing.name = await AuraRingDirectory.nameDialog(auraRing.name, false);

            if (auraRing.name === null) {
                return;
            }

            if (AuraRingDirectory.has(auraRing.name) === true) {
                AuraRingDirectory.remove(auraRing.name);
            }
        }

        const auraRings = AuraRingDirectory.all();
        auraRings.push(auraRing);
        AuraRingDirectory.set(auraRings);
    }

    /**
     * Get an Aura Ring stored in the directory
     * @param {string} name
     */
    static remove(name)
    {
        const auraRings = AuraRingDirectory.all();
        const index = AuraRingApi.getAuraRingIndex(auraRings, name, 'name');

        if (index !== false) {
            auraRings.splice(index, 1);
        }

        AuraRingDirectory.set(auraRings);
    }

    /**
     * Rename an Aura Ring stored in the directory
     * @param {string} oldName
     */
    static async rename(oldName)
    {
        const newName = await AuraRingDirectory.nameDialog(oldName, true);

        if (newName === null) {
            return;
        }

        const auraRing = AuraRingDirectory.get(oldName);
        AuraRingDirectory.remove(oldName);
        AuraRingDirectory.put(auraRing, newName);
    }

    /**
     * Write the complete list of Aura Rings to the directory
     * @param {AuraRing[]} auraRings 
     */
    static set(auraRings)
    {
        auraRings.sort(AuraRingSettings.sortAuraRings);
        game.settings.set(AuraRingFlags.namespace, AuraRingDirectory.name, auraRings);
    }

    // Dialog

    /**
     * Ask the user to provide a name for this Aura Ring
     * @param {string} name
     * @param {bool} renaming
     * @returns {string|null}
     */
    static async nameDialog(name, renaming)
    {
        const title = renaming === true
            ? `Aura Ring Directory: Rename "${name}"`
            : `Aura Ring Directory: Overwrite "${name}"?`

        const content = renaming === true
            ? `<p style="margin: 0;">Provide a new name for this Aura Ring.</p>`
            : `<p style="margin: 0;">An Aura Ring with the name "${name}" already exists in the Directory.</p>
               <p style="margin: 0;">Provide a new name, or leave the name as-is to overwrite the Directory.</p>`

        return await foundry.applications.api.DialogV2.prompt({
            window: {
                icon: 'fas fa-ring',
                title: title,
            },
            content: `
                ${content}
                <input name="name" type="text" value="${name}" autofocus />
                <p class="hint">If you change the name to another one which already exists, it will be overwritten!</p>
            `,
            buttons: [
                {
                    action: null,
                    icon: 'fa-times',
                    label: "Cancel",
                },
            ],
            ok: {
                callback: function (event, button, dialog) {
                    return button.form.elements.name.value;
                },
                label: 'Save',
            },
            rejectClose: false,
        });
    }
}
