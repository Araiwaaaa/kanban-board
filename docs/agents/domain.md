# Domain Docs

How engineering skills should consume this repo's domain documentation.

## Before exploring, read these

- `GLOSSARY.md` at the repo root, or `GLOSSARY-MAP.md` if it exists
- Relevant decisions in `docs/adr/`

If these files do not exist yet, proceed without flagging their absence. Create them when domain terms or architectural decisions are resolved.

## File structure

This is a single-context repo:

```text
/
├── GLOSSARY.md
├── docs/adr/
└── src/
```

## Use the glossary's vocabulary

Use terms as defined in `GLOSSARY.md`. If a needed concept is missing, note the gap rather than inventing conflicting vocabulary.

## Flag ADR conflicts

Surface any output that contradicts an existing ADR rather than silently overriding it.
