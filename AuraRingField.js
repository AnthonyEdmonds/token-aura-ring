export class AuraRingField {
    // Fields
    static booleanField(dataOptions, context)
    {
        return new BooleanField({
            ...dataOptions,
            ...context,
        });
    }

    static colourField(dataOptions, context, stringParams)
    {
        return new ColourField({
            ...dataOptions,
            ...context,
            ...stringParams,
        });
    }

    static numberField(dataOptions, context, numberParams)
    {
        return new NumberField({
            ...dataOptions,
            ...context,
            ...numberParams,
        });
    }

    static stringField(dataOptions, context, stringParams)
    {
        return new StringField({
            ...dataOptions,
            ...context,
            ...stringParams,
        });
    }

    // Settings
    static dataFieldContext(name, parent = null)
    {
        return {
            name: AuraRingField.cleanse(name),
            parent: AuraRingField.cleanse(parent),
        };
    }

    static dataFieldOptions(
        label,
        initial,
        hint = null,
        required = true,
        nullable = false,
        validate = null,
        validationError = null,
        gmOnly = false,
    ) {
        return {
            gmOnly: AuraRingField.cleanse(gmOnly),
            hint: AuraRingField.cleanse(hint),
            initial: AuraRingField.cleanse(initial),
            label: AuraRingField.cleanse(label),
            nullable: AuraRingField.cleanse(nullable),
            required: AuraRingField.cleanse(required),
            validate: AuraRingField.cleanse(validate),
            validationError: AuraRingField.cleanse(validationError),
        };
    }

    static numberFieldParams(
        step = 1,
        min = null,
        max = null,
        integer = false,
        positive = false,
        choices = null,
    ) {
        return {
            choices: AuraRingField.cleanse(choices),
            integer: AuraRingField.cleanse(integer),
            max: AuraRingField.cleanse(max),
            min: AuraRingField.cleanse(min),
            positive: AuraRingField.cleanse(positive),
            step: AuraRingField.cleanse(step),
        };
    }

    static stringFieldParams(
        blank = false,
        trim = true,
        choices = null,
        textSearch = false,
    ) {
        return {
            blank: AuraRingField.cleanse(blank),
            trim: AuraRingField.cleanse(trim),
            choices: AuraRingField.cleanse(choices),
            textSearch: AuraRingField.cleanse(textSearch),
        };
    }

    static cleanse(value)
    {
        return value !== null ? value : undefined;
    }
}

export class BooleanField extends foundry.data.fields.BooleanField
{
    toInput(config={}) {
        const input = super.toInput(config);

        for (let key in config) {
            if (key === 'value') {
                key = 'checked';
            }

            if (key === 'checked' && config[key] != true) {
                continue;
            }

            input.setAttribute(key, config[key]);
        }

        return input;
    }
}

export class ColourField extends foundry.data.fields.ColorField
{
    toInput(config={}) {
        const input = super.toInput(config);

        for (const key in config) {
            input.setAttribute(key, config[key]);
        }

        return input;
    }
}

export class NumberField extends foundry.data.fields.NumberField
{
    toInput(config={}) {
        const input = super.toInput(config);

        for (const key in config) {
            input.setAttribute(key, config[key]);
        }

        return input;
    }
}

export class StringField extends foundry.data.fields.StringField
{
    toInput(config={}) {
        const input = super.toInput(config);

        for (const key in config) {
            input.setAttribute(key, config[key]);
        }

        return input;
    }
}
