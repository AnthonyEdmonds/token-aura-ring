import { Aura } from "./Aura.js";

export class Form
{
    break()
    {
        return document.createElement('hr');
    }

    button(label, icon)
    {
        const buttonIcon = this.icon(icon);
        const text = document.createTextNode(label);

        const button = document.createElement('button');
        button.append(buttonIcon, text);
        button.style.whiteSpace = 'nowrap';
        button.type = 'button';

        return button;
    }

    colour(name, aura, key)
    {
        const readout = this.input(name, aura, key, 'text');
        readout.classList.add('color');

        const picker = this.input(name, aura, key, 'color');
        picker.removeAttribute('name');
        picker.setAttribute('data-edit', this.name(name, 'colour'));

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
        const fields = document.createElement('div');
        fields.classList.add('form-fields');
        fields.append(...inputs);
        return fields;
    }

    id(name)
    {
        return `aura-${name}`;
    }

    input(name, aura, key, type)
    {
        const input = document.createElement('input');
        input.name = this.name(name, key);
        input.type = type;
        input.value = aura.hasOwnProperty(key) === true
            ? aura[key]
            : '';
        
        return input;
    }

    label(text)
    {
        const label = document.createElement('label');
        label.innerText = text;
        return label;
    }

    name(name, key)
    {
        return `flags.${Aura.namespace}.${name}.${key}`;
    }

    number(name, aura, key, max = null, min = 0, step = 'any')
    {
        const input = this.input(name, aura, key, 'number');
        input.max = max;
        input.min = min;
        input.step = step;

        return this.fields(input);
    }

    range(name, aura, key, max = 1, min = 0, step = 0.05)
    {
        const input = this.input(name, aura, key, 'range');
        input.max = max;
        input.min = min;
        input.step = step;
        input.value = aura[key];

        const readout = document.createElement('span');
        readout.classList.add('range-value');
        readout.innerHTML = aura[key];

        return this.fields(input, readout);
    }

    select(name, aura, key, choices)
    {
        const select = document.createElement('select');
        select.name = this.name(name, key);

        let options = [];
        for (const choice of choices) {
            const option = document.createElement('option');
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
