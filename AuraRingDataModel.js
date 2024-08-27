import { AuraRingField, BooleanField } from "./AuraRingField.js";

export class AuraRingDataModel extends foundry.abstract.DataModel 
{
    // Setup
    fieldList = [
        [
            'name',
            'visibility',
        ],
        [
            'radius',
            'angle',
            'direction',
        ],
        [
            'stroke_colour',
            'stroke_opacity',
            'stroke_weight',
            'stroke_close',
        ],
        [
            'fill_colour',
            'fill_opacity',
        ],
    ];

    static defineSchema() 
    {
        const defaults = AuraRingDataModel.defaultSettings();

        return {
            angle: AuraRingDataModel.angleField(defaults.angle),
            direction: AuraRingDataModel.directionField(defaults.direction),
            fill_colour: AuraRingDataModel.fillColourField(defaults.fill_colour),
            fill_opacity: AuraRingDataModel.fillOpacityField(defaults.fill_opacity),
            id: AuraRingDataModel.idField(defaults.id),
            name: AuraRingDataModel.nameField(defaults.name),
            radius: AuraRingDataModel.radiusField(defaults.radius),
            stroke_close: AuraRingDataModel.strokeCloseField(defaults.stroke_close),
            stroke_colour: AuraRingDataModel.strokeColourField(defaults.stroke_colour),
            stroke_opacity: AuraRingDataModel.strokeOpacityField(defaults.stroke_opacity),
            stroke_weight: AuraRingDataModel.strokeWeightField(defaults.stroke_weight),
            visibility: AuraRingDataModel.visibilityField(defaults.visibility),
        };
    }

    static defaultSettings()
    {
        return {
            angle: 360,
            direction: 0,
            fill_colour: '#000000',
            fill_opacity: 0,
            id: 0,
            name: 'Aura',
            radius: 20,
            stroke_close: false,
            stroke_colour: '#000000',
            stroke_opacity: 0.5,
            stroke_weight: 4,
            visibility: 'PLAYER',
        };
    }

    // Forms
    toFormGroup()
    {
        const section = document.createElement('section');
        const divider = document.createElement('hr');

        const heading = document.createElement('h2');
        heading.innerHTML = this.name;
        heading.classList.add('border');
        section.appendChild(heading);

        let first = true;
        for (const fields of this.fieldList) {
            first === true
                ? first = false
                : section.appendChild(divider.cloneNode());
            
            for (const field of fields) {
                const inputConfig = {
                    name: `${this.id}_${field}`,
                };

                inputConfig.value = this[field];
                
                if (field === 'name') {
                    inputConfig['data-action'] = 'renameAuraRing';
                    inputConfig['data-aura'] = this.id;
                }
    
                const formGroup = this.schema.fields[field].toFormGroup({}, inputConfig);
                section.appendChild(formGroup);
            }
        }

        return section;
    }

    // Data
    static roles()
    {
        const roles = {};
        const userRoles = Object.values(CONST.USER_ROLE_NAMES);

        for (const role of userRoles) {
            roles[role] = role;
        }

        return roles;
    }

    static migrateData(source)
    {
        if (source.hasOwnProperty('colour') === true) {
            source.stroke_colour = source.colour;
            delete source.colour;
        }

        if (source.hasOwnProperty('opacity') === true) {
            source.stroke_opacity = source.opacity;
            delete source.opacity;
        }

        if (source.hasOwnProperty('weight') === true) {
            source.stroke_weight = source.weight;
            delete source.weight;
        }

        return source;
    }

    // Fields
    static angleField(initial)
    {
        return AuraRingField.numberField(
            AuraRingField.dataFieldOptions(
                'Angle (degrees)',
                initial,
                'How much of the circle to draw.',
            ),
            AuraRingField.dataFieldContext(
                'angle',
            ),
            AuraRingField.numberFieldParams(
                5,
                5,
                360,
                true,
                true,
            )
        );
    }

    static directionField(initial)
    {
        return AuraRingField.numberField(
            AuraRingField.dataFieldOptions(
                'Direction (degrees)',
                initial,
                'From the top of the token where 0 is "forward"; rotates with the token.',
            ),
            AuraRingField.dataFieldContext(
                'direction',
            ),
            AuraRingField.numberFieldParams(
                1,
                -180,
                180,
                true,
            )
        );
    }

    static fillColourField(initial)
    {
        return AuraRingField.colourField(
            AuraRingField.dataFieldOptions(
                'Fill Colour',
                initial,
            ),
            AuraRingField.dataFieldContext(
                'fill_colour',
            ),
            AuraRingField.stringFieldParams(
                false,
                true,
            ),
        );
    }

    static fillOpacityField(initial)
    {
        return AuraRingField.numberField(
            AuraRingField.dataFieldOptions(
                'Fill Opacity',
                initial,
            ),
            AuraRingField.dataFieldContext(
                'fill_opacity',
            ),
            AuraRingField.numberFieldParams(
                0.05,
                0,
                1,
                false,
            ),
        );
    }

    static idField(initial)
    {
        return AuraRingField.numberField(
            AuraRingField.dataFieldOptions(
                'ID',
                initial,
                'The unique identifier of this Aura Ring.',
            ),
            AuraRingField.dataFieldContext(
                'id',
            ),
            AuraRingField.numberFieldParams(
                1,
                0,
                null,
                true,
            )
        );
    }

    static nameField(initial)
    {
        return AuraRingField.stringField(
            AuraRingField.dataFieldOptions(
                'Name',
                initial,
                null,
                true,
                false,
                function () {
                    return true; // TODO Check is unique
                },
                'must be unique.',
            ),
            AuraRingField.dataFieldContext(
                'name',
            ),
            AuraRingField.stringFieldParams(
                false,
                true,
            ),
        );
    }

    static radiusField(initial)
    {
        return AuraRingField.numberField(
            AuraRingField.dataFieldOptions(
                `Radius (${game.scenes.current.grid.units})`,
                initial,
                'Size of the Aura Ring from the edge of the token.',
            ),
            AuraRingField.dataFieldContext(
                'radius',
            ),
            AuraRingField.numberFieldParams(
                null,
                null,
                null,
                false,
            ),
        );
    }

    static strokeCloseField(initial)
    {
        return AuraRingField.booleanField(
            AuraRingField.dataFieldOptions(
                'Close Stroke?',
                initial,
                'Draw a complete outline when using an angled Aura.',
            ),
            AuraRingField.dataFieldContext(
                'stroke_close',
            ),
        );
    }

    static strokeColourField(initial)
    {
        return AuraRingField.colourField(
            AuraRingField.dataFieldOptions(
                'Stroke Colour',
                initial,
            ),
            AuraRingField.dataFieldContext(
                'stroke_colour',
            ),
            AuraRingField.stringFieldParams(
                false,
                true,
            ),
        );
    }

    static strokeOpacityField(initial)
    {
        return AuraRingField.numberField(
            AuraRingField.dataFieldOptions(
                'Stroke Opacity',
                initial,
            ),
            AuraRingField.dataFieldContext(
                'stroke_opacity',
            ),
            AuraRingField.numberFieldParams(
                0.05,
                0,
                1,
                false,
                true,
            ),
        );
    }

    static strokeWeightField(initial)
    {
        return AuraRingField.numberField(
            AuraRingField.dataFieldOptions(
                'Stroke Weight (pixels)',
                initial,
            ),
            AuraRingField.dataFieldContext(
                'stroke_weight',
            ),
            AuraRingField.numberFieldParams(
                1,
                1,
                null,
                true,
                true,
            ),
        );
    }

    static visibilityField(initial)
    {
        return AuraRingField.stringField(
            AuraRingField.dataFieldOptions(
                'Visibile to',
                initial,
                null,
                true,
                false,
                function () {
                    return true; // TODO Check is unique
                },
                'must be unique.',
            ),
            AuraRingField.dataFieldContext(
                'visibility',
            ),
            AuraRingField.stringFieldParams(
                false,
                true,
                AuraRingDataModel.roles(),
            ),
        );
    }
}