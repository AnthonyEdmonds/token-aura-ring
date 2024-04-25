import { Aura } from "./Aura.js";
import { Form } from "./Form.js";

export class Config
{
    form = new Form();

    colour(aura)
    {
        return this.form.group(
            'Colour',
            this.form.colour(aura, 'colour'),
        );
    }

    opacity(aura)
    {
        return this.form.group(
            'Opacity',
            this.form.range(aura, 'opacity'),
        );
    }

    options(aura)
    {
        let options = document.createElement('div');
        options.classList.add('tab');
        options.setAttribute('data-tab', Aura.flagsNamespace);

        options.append(
            this.radius(aura),
            this.colour(aura),
            this.opacity(aura),
            this.weight(aura),
            this.visibility(aura),
        );

        return options;
    }

    radius(aura)
    {
        return this.form.group(
            'Radius (' + game.scenes.current.grid.units + ')',
            this.form.number(aura, 'radius'),
        );
    }
    
    show(config)
    {
        let aura;
        let simpleTokenDocument = config.token;

        if (Aura.hasFlags(simpleTokenDocument) !== true) {
            aura = Aura.flags();
            simpleTokenDocument.setFlag(Aura.flagsNamespace, Aura.flagsKey, aura);
        } else {
            aura = simpleTokenDocument.getFlag(Aura.flagsNamespace, Aura.flagsKey);
        }

        config.position.width = 580;
        config.setPosition(config.position);
        config._tabs[0]._nav.appendChild(this.tab());

        config._tabs[0]._content.insertBefore(
            this.options(aura), 
            config._tabs[0]._content.lastElementChild,
        );
    }

    tab()
    {
        let icon = document.createElement('i');
        icon.classList.add('fas', 'fa-ring');

        let text = document.createTextNode('Aura Ring');
        
        let link = document.createElement('a');
        link.classList.add('item');
        link.setAttribute('data-tab', Aura.flagsNamespace);
        link.append(icon, text);

        return link;
    }

    visibility(aura)
    {
        return this.form.group(
            'Visibility',
            this.form.select(aura, 'visibility', Object.values(CONST.USER_ROLE_NAMES)),
        );
    }

    weight(aura)
    {
        return this.form.group(
            'Weight (px)',
            this.form.range(aura, 'weight', 16, 1, 1),
        );
    }
}
