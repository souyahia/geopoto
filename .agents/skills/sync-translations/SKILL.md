---
name: sync-translations
description: Synchronizes other languages translation files with the English reference files.
---

Developers in this project usually only develop using English translations, and it is up to AI agents to translate these into the other languages. The translation files are located in the `apps/mobile/translations` directory.

When this skill is used by the user, make sure to align every translation file to the english one. Usually the user will have either added, removed or modified the translations, make sure that the JSON structure of every translation file is the same.

When performing translations, make sure to take into account the context in which the translation is used so that the translation can be accurate.
