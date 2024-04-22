import { Aura } from "./Aura.js";

export class Form
{
    colour(aura, key)
    {
        let readout = this.input(aura, key, 'text');
        readout.classList.add('color');

        let picker = this.input(aura, key, 'color');
        picker.removeAttribute('name');
        picker.setAttribute('data-edit', this.name('colour'));

        readout.addEventListener('change', this.copyValue.bind(this, readout, picker));
        picker.addEventListener('change', this.copyValue.bind(this, picker, readout));

        return this.fields(readout, picker);
    }

    copyValue(source, target)
    {
        target.value = source.value;
    }

    fields(...inputs)
    {
        let fields = document.createElement('div');
        fields.classList.add('form-fields');
        fields.append(...inputs);
        return fields;
    }

    group(label, input)
    {
        let formGroup = document.createElement('div');
        formGroup.classList.add('form-group');
        formGroup.append(this.label(label), input);
        return formGroup;
    }

    input(aura, key, type)
    {
        let input = document.createElement('input');
        input.name = this.name(key);
        input.type = type;
        input.value = aura[key];
        return input;
    }

    label(text)
    {
        let label = document.createElement('label');
        label.innerText = text;
        return label;
    }

    name(key)
    {
        return `flags.${Aura.flagsNamespace}.${Aura.flagsKey}.${key}`;
    }

    number(aura, key, max = null, min = 0, step = 'any')
    {
        let input = this.input(aura, key, 'number');
        input.max = max;
        input.min = min;
        input.step = step;

        return this.fields(input);
    }

    range(aura, key, max = 1, min = 0, step = 0.05)
    {
        let input = this.input(aura, key, 'range');
        input.max = max;
        input.min = min;
        input.step = step;
        input.value = aura[key];

        let readout = document.createElement('span');
        readout.classList.add('range-value');
        readout.innerHTML = aura[key];

        return this.fields(input, readout);
    }

    select(aura, key, choices)
    {
        let select = document.createElement('select');
        select.name = this.name(key);

        let options = [];
        for (let choice of choices) {
            let option = document.createElement('option');
            option.innerHTML = choice;
            option.value = choice;

            if (aura[key] === choice) {
                option.selected = true;
            }

            options.push(option);
        }

        select.append(...options);

        return this.fields(select);
    }
}
