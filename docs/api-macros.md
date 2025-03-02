[< Back](../readme.md)

# API & Macros

Module developers can control Aura Rings using the `AuraRingApi` class.

Macro developers can control Aura Rings using the `TokenAuraRing` global variable.

| Function  | Parameters                        | Returns          | Description |
|-----------|-----------------------------------|------------------|-------------|
| all       | TokenDocument                     | Array[AuraRing]  | Retrieve all Aura Rings |
| blank     |                                   | AuraRing         | Get an unsaved empty Aura Ring without an ID |
| delete    | TokenDocument, id                 |                  | Remove an Aura Ring |
| deleteAll | TokenDocument                     |                  | Remove all Aura Rings |
| directory | TokenDocument|null                |                  | Open the Aura Ring Directory, optionally with a pre-selected token |
| get       | TokenDocument, term, field = 'id' | AuraRing\|false  | Retrieve a specific Aura Ring by a field, ID by default |
| index     | TokenDocument                     | Object{id: name} | Retrieve a list of Aura Ring names keyed by their ID |
| new       | TokenDocument                     | AuraRing         | Create a new Aura Ring from the default settings |
| set       | TokenDocument, AuraRing           |                  | Add or overwrite an Aura Ring |
| setAll    | TokenDocument, Array[AuraRing]    |                  | Overwrite all Aura Rings with a new set |
| setValue  | TokenDocument, id, key, value     |                  | Update a specific Aura Ring value directly |

All changes will trigger flag updates on the SimpleTokenDocument, and can be edited in the normal UI.

It is left up to the module developer to ensure that any set Aura Rings are valid.

## Macro examples

### List AuraRings
This macro will list all of the Aura Rings on the selected token:

1. Create a new `script` macro
2. Paste the following:
   ```javascript
   console.log(
       TokenAuraRing.all(token.document),
   );
   ```
3. Select a token and run the macro to see a list of the Aura Rings on that token in the console

### Toggle an Aura Ring

This macro will toggle an Aura Ring on and off:

```javascript
const auraRing = TokenAuraRing.get(token.document, 'My Aura', 'name');
TokenAuraRing.setValue(token.document, auraRing.id, 'hide', !auraRing.hide)
```

Replace `'My Aura'` with the name of the Aura Ring you want to toggle.

### Open the Directory

This macro will open the Aura Ring Directory:

```javascript
TokenAuraRing.directory();
```
