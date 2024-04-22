import { Aura } from './Aura.js';
import { Config } from './Config.js';

export const AuraRingConfig = new Config();
Hooks.on('renderTokenConfig', AuraRingConfig.show.bind(AuraRingConfig));
Hooks.on('initializeVisionSources', Aura.setup);
