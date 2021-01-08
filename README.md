# ⚙ Smart Rem

**Note:** This is not yet meant to be user friendly. Everything can change and break. (E.g. I might want to identify special smart rems with tags instead of >>> in the future.)

## How to try it

Run it directly in DevTools of a Chrome browser or the Desktop App:

- Press F12 (or Alt, Ctrl + Shift + I on Desktop)
- Goto Sources > Snippets
- Make a new Snippet
- Paste the code from `smart-rem.js`
  - Make sure that the line `db = await idb.openDB("lnotes", 24);` contains your actual database (`lnotes` in this case). If not, replace it with the correct one.
  - You can find the correct database by going to Application > Storage > IndexedDB and looking for the database with a quanta store which has many entries. (IDK if this is also the case on the Desktop app). ![IndexedDB](img/IndexedDB.png)
- Execute with Ctrl + Enter.
  - You have to reexecute every time you refresh the page or restart the app and want to use smart rem.

Note: You have to reexecute the snippet each time you refresh the page and want use smart rems.

## Available Smart Rem

**TODO:** Add all with example incovation, screenshot, possible caveats and maybe roadmap.

### Embed

```
>>> embed: en.wikipedia.org/wiki/Zettelkasten
```

![embed demo](img/smart-rem-embed.png)

**Note:** There are only very few sites which let themselves be embedded. Many sites (youtube, pdfs from cloud storage) require generating a special embed url for example. Wikimedia sites should work.
