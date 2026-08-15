# OS3 Agent Instructions

## Context Discovery

Before beginning a non-trivial task:

1. Read `primary.md`.
2. Identify the repository area relevant to the task.
3. Read that directory's `wiki.md`.
4. Follow relevant subdirectory wiki files recursively.
5. Identify the minimum set of source files required.
6. Read those source files.
7. Inspect relevant tests.
8. Only then create an implementation plan.

Do not recursively read every wiki in the repository.

Do not treat wiki files as source code.

Do not assume wiki descriptions are authoritative when they conflict
with the actual source.

## Wiki Maintenance

After modifying the repository:

- New file → add it to its parent wiki.
- Deleted file → remove it from its parent wiki.
- Moved file → update affected wikis.
- New directory → create its wiki and update its parent wiki.
- Removed directory → remove its wiki and parent entry.
- Materially changed file responsibility → update its one-line description.

Do not regenerate all wiki files after every change.

Update only affected navigation metadata.
