# CLAUDE.md

@AGENTS.md

## Claude Code notes

- `AGENTS.md` (imported above) is the source of truth for the stack, layout and conventions. Keep shared project facts there and put only Claude-specific guidance in this file.
- The backend repo is at `~/Desktop/buyFromUs` (Symfony / PHP). Read the relevant controller there before wiring or changing an API call. Don't assume payload or response shapes.
- When adding translations, edit both `src/locales/langs/en.json` and `fr.json` in the same change.
- Verify with `npx tsc --noEmit -p .` filtered to the files you changed. IDE diagnostics that appear in the middle of a multi-file edit can be stale, so re-check with the compiler before acting on them.
- Keep UI wording as "markup" (French "majoration"), even where the code still says `margin`.
