# Customizing content

The game content is represented by set of text files (notes) in [Markdown](https://www.markdownguide.org/) format.
You can use any text editor to edit them.

## YAML frontmatter

In order to store structural information in Markdown notes, game uses YAML frontmatter:

```YAML
---
author: Someone
colors: [ magenta, red ]
---
```

Frontmatter format is tested to be compatible with the [Obsidian](https://obsidian.md/).

## Organizing notes

Notes are located in `data` folder. You can place note in any subfolder.
I generally create subfolders by author, but you may choose different approach.

## Note colors

Note can be displayed in one of the 8 colors, which should be set by `colors` tag in frontmatter.
At least one color is required!

```YAML
---
author: Someone
colors: [ white, magenta, blue, cyan, green, yellow, orange, red ]
---
```

## Notes in different languages

Every note have alphanumeric hash, like `0b11ffca.md`.
Other than English language versions should have two-letter language code suffix, like `0b11ffca-ru.md` and `lang: XX` tag in frontmatter, like that:

```YAML
---
author: Me
colors: [ magenta, red ]
lang: ru
---
```

## Links

If you want a note to have direct link to another note, use `link` tag with target note hash:

```YAML
---
author: Someone
colors: [ magenta, red ]
lang: ru
link: 6414ff15
---
```

## Hyperlinks

If you want a note to have a hyperlink to external resource `href` tag with target URI:

```YAML
---
author: Someone
colors: [ magenta, red ]
href: https://someone.me
---
```

## Content reuse

Follow license and content reuse rules provided by original authors there possible!

Provide license info using `license` tag in frontmatter and hyperlinks to the original.

```YAML
---
author: Multiple
colors: [ white ]
href: https://en.wikipedia.org/wiki/Main_Page
license: CC-BY-SA
---
```

Note that you can add your custom tags to frontmatter, with additional info, if needed.

## Compiling notes

In order to use new notes or see changes in them at runtime, notes should be compiled to `data.js` file.
To do that, open project root folder in terminal and execute:

```Shell
node ./buildData.js
```

## Publishing your version

Publishing is designed to be as simple as possible!

Currently I use the GitHub Pages pipeline for that. After inital setup, it's just:

1. Make changes in notes/scripts.
2. Run `buildData.js` to update `data.js` file.
3. Commit changes to *master* branch.
4. Create and merge pull request from *master* to *website* branch.
5. Wait GitHub Pages pipeline to update the website.

More details about how to setup that are coming.
