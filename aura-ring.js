import { Aura } from './Aura.js';
import { Settings } from './Settings.js';

Hooks.on('renderTokenConfig', Settings.addSettingsButtonToConfig);
Hooks.on('initializeVisionSources', Aura.setup);

// TODO "Close" outline toggle
// TODO Rotating to the right breaks angle?
// TODO Add button to Token config
// TODO Link auras to token / save / update
// TODO Preview changes
// TODO Remove old files
// TODO Delete dialogue
// TODO Duplicate dialogue w/name
// TODO Store Aura settings on Actor?
