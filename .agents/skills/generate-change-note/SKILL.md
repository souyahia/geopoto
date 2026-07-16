---
name: generate-change-note
description: Generates the change note markdown file for the next patch version, based on the current branch changes, formatted for both the iOS and Android stores.
---

This skill generates a user facing change note for the next release of the app. Change notes live in the `changenotes` directory at the root of the repository, with one markdown file per version number (for example `changenotes/1.0.6.md`).

Follow these steps every time this skill is used.

## 1. Determine the next version number

Read the `version` field in `apps/mobile/package.json`. This is the current version (for example `1.0.5`).

The next version is always a **patch** bump, never a minor or major one. Increment only the last number:

- `1.0.5` becomes `1.0.6`
- `1.0.8` becomes `1.0.9`
- `1.0.9` becomes `1.0.10`

The change note file to create is `changenotes/<next-version>.md`. If that file already exists, regenerate it (overwrite it).

## 2. Collect the changes to describe

Base the change note on the changes made in the current branch compared to `main`. Inspect both the commit history and the diff:

- `git log main..HEAD` for the list of commits
- `git diff main...HEAD` for the actual changes

## 3. Decide what to include

The change note is read by end users on the App Store and Google Play. Only describe changes that are **visible to users**.

Include things like:

- New features and quiz modes
- User facing bug fixes
- Visible content corrections (flag updates, country or capital name corrections, map fixes)
- Layout and usability improvements

Exclude anything a user would never notice, for example:

- Refactors, code cleanup and internal renames
- Build, tooling, CI and dependency changes
- Data generation scripts, tests and invariants
- Documentation and README changes

Write the notes in a concise, friendly tone. Group related changes together and keep the wording simple. Do not mention version numbers of removed or internal items.

## 4. Write the single canonical note, then translate it

Write one canonical change note, then translate the exact same content into every language. The wording used for iOS and Android must be **identical**, only the surrounding formatting differs.

The note must be produced in these six languages:

- English
- French
- German
- Italian
- Portuguese
- Spanish

Follow the project writing conventions: never use em dashes or en dashes (`-` or `--`), and always include the proper accents in French, German, Italian, Portuguese and Spanish text.

## 5. Produce the file

Create `changenotes/<next-version>.md` with exactly this structure (this example uses `1.0.9`, replace it with the real next version). The outer fence below uses four backticks only so this documentation can show the inner Android code block, the actual file must not include the outer four backtick fence:

````markdown
# Geopoto 1.0.9 Change Note

## iOS

### English

<change note in english>

### French

<change note in french>

### German

<change note in german>

### Italian

<change note in italian>

### Portuguese

<change note in portuguese>

### Spanish

<change note in spanish>

## Android

```
<en-US>
<change note in english>
</en-US>
<de-DE>
<change note in german>
</de-DE>
<es-419>
<change note in spanish>
</es-419>
<es-ES>
<change note in spanish>
</es-ES>
<es-US>
<change note in spanish>
</es-US>
<fr-CA>
<change note in french>
</fr-CA>
<fr-FR>
<change note in french>
</fr-FR>
<it-IT>
<change note in italian>
</it-IT>
<pt-BR>
<change note in portuguese>
</pt-BR>
<pt-PT>
<change note in portuguese>
</pt-PT>
```
````

Notes about the Android section:

- The whole Android block is wrapped in a fenced code block.
- Each locale tag reuses the matching language note. The regional variants share the same text:
  - `en-US` uses the English note
  - `de-DE` uses the German note
  - `es-419`, `es-ES` and `es-US` all use the Spanish note
  - `fr-CA` and `fr-FR` both use the French note
  - `it-IT` uses the Italian note
  - `pt-BR` and `pt-PT` both use the Portuguese note
- Keep the locale tags in the exact order shown above.

## 6. Format and commit

Once the change note file is written:

1. Run the formatter from the root of the repository with `pnpm format:fix` so the new file matches the project formatting.
2. Commit all of the changes.

