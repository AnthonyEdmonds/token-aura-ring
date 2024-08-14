export class Form {
    // Fields
    static booleanField(dataOptions, context)
    {
        return new foundry.data.fields.BooleanField({
            ...dataOptions,
            ...context,
        });
    }

    static colourField(dataOptions, context, stringParams)
    {
        return new foundry.data.fields.ColorField({
            ...dataOptions,
            ...context,
            ...stringParams,
        });
    }

    static numberField(dataOptions, context, numberParams)
    {
        return new foundry.data.fields.NumberField({
            ...dataOptions,
            ...context,
            ...numberParams,
        });
    }

    static stringField(dataOptions, context, stringParams)
    {
        return new foundry.data.fields.StringField({
            ...dataOptions,
            ...context,
            ...stringParams,
        });
    }

    // Settings
    static dataFieldContext(name, parent = null)
    {
        return {
            name: Form.cleanse(name),
            parent: Form.cleanse(parent),
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
            gmOnly: Form.cleanse(gmOnly),
            hint: Form.cleanse(hint),
            initial: Form.cleanse(initial),
            label: Form.cleanse(label),
            nullable: Form.cleanse(nullable),
            required: Form.cleanse(required),
            validate: Form.cleanse(validate),
            validationError: Form.cleanse(validationError),
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
            choices: Form.cleanse(choices),
            integer: Form.cleanse(integer),
            max: Form.cleanse(max),
            min: Form.cleanse(min),
            positive: Form.cleanse(positive),
            step: Form.cleanse(step),
        };
    }

    static stringFieldParams(
        blank = false,
        trim = true,
        choices = null,
        textSearch = false,
    ) {
        return {
            blank: Form.cleanse(blank),
            trim: Form.cleanse(trim),
            choices: Form.cleanse(choices),
            textSearch: Form.cleanse(textSearch),
        };
    }

    static cleanse(value)
    {
        return value !== null ? value : undefined;
    }
}
