import { Form } from "./Form.js";

export class AuraRing extends foundry.abstract.DataModel {
    // TODO Pass in stored token / aura item for use in schema

    static defineSchema() {
        return {
            angle: AuraRing.angleField(),
            direction: AuraRing.directionField(),
            fill : {
                colour: AuraRing.fillColourField(),
                opacity: AuraRing.fillOpacityField(),
            },
            name: AuraRing.nameField(),
            radius: AuraRing.radiusField(),
            stroke: {
                close: AuraRing.strokeCloseField(),
                colour: AuraRing.strokeColourField(),
                opacity: AuraRing.strokeOpacityField(),
                weight: AuraRing.strokeWeightField(),
            },
            visibility: AuraRing.visibilityField(),
        };
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

    // Fields
    static angleField()
    {
        return Form.numberField(
            Form.dataFieldOptions(
                'Angle (degrees)',
                360,
                'How much of the circle to draw.',
            ),
            Form.dataFieldContext(
                '.angle',
            ),
            Form.numberFieldParams(
                5,
                5,
                360,
                true,
                true,
            )
        );
    }

    static directionField()
    {
        return Form.numberField(
            Form.dataFieldOptions(
                'Direction (degrees)',
                0,
                'From the top of the token, where 0 is "forward". The Aura Ring will rotate with the token.',
            ),
            Form.dataFieldContext(
                '.direction',
            ),
            Form.numberFieldParams(
                1,
                -180,
                180,
                true,
                false,
            )
        );
    }

    static fillColourField()
    {
        return Form.colourField(
            Form.dataFieldOptions(
                'Fill Colour',
                '#000000',
            ),
            Form.dataFieldContext(
                '.fill.colour',
            ),
            Form.stringFieldParams(
                false,
                true,
            ),
        );
    }

    static fillOpacityField()
    {
        return Form.numberField(
            Form.dataFieldOptions(
                'Fill Opacity',
                0,
                'Set to 0 to hide the fill.',
            ),
            Form.dataFieldContext(
                '.fill.opacity',
            ),
            Form.numberFieldParams(
                0.05,
                0,
                1,
                false,
                true,
            ),
        );
    }

    static nameField()
    {
        return Form.stringField(
            Form.dataFieldOptions(
                'Name',
                'Aura', // TODO #
                'A unique name for this Aura Ring.',
                true,
                false,
                function () {
                    return true; // TODO Check is unique
                },
                'must be unique.',
            ),
            Form.dataFieldContext(
                '.name', // TODO Key
            ),
            Form.stringFieldParams(
                false,
                true,
            ),
        );
    }

    static radiusField()
    {
        return Form.numberField(
            Form.dataFieldOptions(
                'Radius',
                0,
                'How large the Aura Ring is, drawn from the edge of the token. Set to 0 to hide the Aura.',
            ),
            Form.dataFieldContext(
                '.radius',
            ),
            Form.numberFieldParams(
                null,
                null,
                null,
                false,
                true,
            ),
        );
    }

    static strokeCloseField()
    {
        return Form.booleanField(
            Form.dataFieldOptions(
                'Close Stroke?',
                false,
                'Draw a complete outline when using an angled Aura.',
            ),
            Form.dataFieldContext(
                '.stroke.close',
            ),
        );
    }

    static strokeColourField()
    {
        return Form.colourField(
            Form.dataFieldOptions(
                'Stroke Colour',
                '#000000',
            ),
            Form.dataFieldContext(
                '.stroke.colour',
            ),
            Form.stringFieldParams(
                false,
                true,
            ),
        );
    }

    static strokeOpacityField()
    {
        return Form.numberField(
            Form.dataFieldOptions(
                'Stroke Opacity',
                1,
                'Set to 0 to hide the outline.',
            ),
            Form.dataFieldContext(
                '.stroke.opacity',
            ),
            Form.numberFieldParams(
                0.05,
                0,
                1,
                false,
                true,
            ),
        );
    }

    static strokeWeightField()
    {
        return Form.numberField(
            Form.dataFieldOptions(
                'Stroke Weight (pixels)',
                4,
                'How thick the outline should be.',
            ),
            Form.dataFieldContext(
                '.stroke.weight',
            ),
            Form.numberFieldParams(
                1,
                1,
                null,
                true,
                true,
            ),
        );
    }

    static visibilityField()
    {
        return Form.stringField(
            Form.dataFieldOptions(
                'Visibility',
                'PLAYER',
                'Which roles should be able to see the Aura Ring.',
                true,
                false,
                function () {
                    return true; // TODO Check is unique
                },
                'must be unique.',
            ),
            Form.dataFieldContext(
                '.visibility', // TODO Key
            ),
            Form.stringFieldParams(
                false,
                true,
                AuraRing.roles(),
            ),
        );
    }
}
