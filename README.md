# Token Aura Ring

A simple module for Foundry VTT which adds outlined aura rings to a token.

![How token aura rings appear to the game master](images/gm.jpg)

## About

This Foundry VTT module allows you to add and customise aura rings emanated from a token, ideal for cleanly representing the range of aura type effects without obscuring the map.

Aura rings are calculated as an emanation, based on the [Pathfinder 2nd Edition rules](https://2e.aonprd.com/Rules.aspx?ID=2387). This means that the range of the aura ring is calculated from the edge of the token, instead of the centre.

![How token aura rings appear to players](images/player.jpg)

Visibility of aura rings are obscured by fog-of-war, and hidden entirely when the viewing player is unable to see the token from which the aura rings are being emitted.

Hidden tokens will only show their aura rings to the game master.

## What's the difference between this and Dynamic Token Rings?

Dynamic Token Rings, which is a Foundry VTT v12 feature, adds a ring directly around the edge of a token to represent resources, such as health or mana.

Token Aura Ring draws an arbitrary ring at any range from the token's edge.

## Installation

Either search for and install this module within Foundry VTT, or copy this address into the `Manifest URL` bar:

```
https://raw.githubusercontent.com/AnthonyEdmonds/token-aura-ring/main/module.json
```

## Usage

Once enabled, you can add and configure aura rings from the "Confgiure Token Aura Rings" button on the "Identity" tab of any token settings page (to avoid any confusion with dynamic token rings).

![An example of a token aura ring configuration](images/config.jpg)

Settings are fully previewed, and are not stored until you press "Save Changes" and "Update Token".

### Stroke and fill

Aura rings may be drawn as an outline, a solid fill, or both.

![An example of an aura ring with a mixture of strokes and fills](images/stroke_fill.jpg)

The colour, opacity, and weight can be individually controlled, and strokes have the option of being "closed" if a complete outline is desired.

### Multiple aura rings

You can add up to 100 aura rings to a single token by pressing the "Add Aura Ring" button.

Press the "Duplicate Aura Ring" button to create an exact copy of the currently selected aura ring.

Press the "Delete Aura Ring" button to remove the currently selected aura ring.

### Visibility

You can control which user roles can see an aura ring using the "Visible to" setting.

### Angled aura rings

You can adjust the "Direction" and "Angle" settings to create arcs instead of circles.

![An example of a token with arcs instead of circles](images/arc.jpg)

The "Angle" setting determines how much of the arc to draw.

The "Direction" setting rotates the arc around the token.

Arcs are drawn relative to the top of the token, where a direction of "0" is considered facing forward.

The arc is centralised around its direction, where an angle of "90" would have 45 degrees on either side.

When you rotate the token the arc will rotate with it.

Setting the "Angle" to "360" will draw a complete circle.

## Issues

This module may not work with game systems or addons which already implement their own token auras.

If you encounter any problems, raise a ticket on Github and I'll take a look.
