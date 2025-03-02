# Token Aura Ring

A module for Foundry VTT which adds outlined aura rings to a token.

![How token aura rings appear to the game master](images/gm.jpg)

## About

This Foundry VTT module allows you to add and customise aura rings emanated from a token, ideal for cleanly representing the range of aura type effects without obscuring the map.

Aura rings are calculated as an emanation, based on the [Pathfinder 2nd Edition rules](https://2e.aonprd.com/Rules.aspx?ID=2387). This means that the range of the aura ring is calculated from the edge of the token, instead of the centre.

![How token aura rings appear to players](images/player.jpg)

Creatures larger than 1 tile will have flattened sides to correctly represent their aura range.

Visibility of aura rings can be obscured by fog-of-war, and hidden entirely when the viewing player is unable to see the token from which the aura rings are being emitted.

Hidden tokens will only show their aura rings to the game master.

## What's the difference between this and Dynamic Token Rings?

Dynamic Token Rings, which is a Foundry VTT v12 feature, adds a ring directly around the edge of a token to represent resources, such as health or mana.

Token Aura Ring draws an arbitrary ring at any range from the token's edge.

## Installation

Either search for and install this module within Foundry VTT, or copy this address into the `Manifest URL` bar:

```
https://raw.githubusercontent.com/AnthonyEdmonds/token-aura-ring/main/module.json
```

## Documentation

* [Configuring and using Aura Rings](docs/usage.md)
* [Reusing Aura Rings with the Directory](docs/directory.md)
* [Changing Aura Rings using Active Effects and Attributes](docs/active-effects.md)
* [Controlling Aura Rings using the API and Macros](docs/api-macros.md)

## Issues

This module may not work with game systems or addons which already implement their own token auras.

If you encounter any problems, raise a ticket on Github and I'll take a look.
