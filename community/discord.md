# Discord

A small, private research server for people actively working on this problem.

**[Join the server →](https://discord.gg/E65kyCNgSS)**

## What the server is for

- Coordination between people running experiments.
- Review of findings before they are written up.
- Sanitised evidence sharing under a clear "no credentials" rule.
- Onboarding for contributors who want to work on a specific open question.

It is **not**:

- a support desk for getting restricted games running,
- a marketplace for accounts, tokens, consoles or files,
- a place to post captures, keys or personal data.

## Research topics

| Area | Examples |
|---|---|
| Authentication | XSTS claims, device tokens, SISU flows, offering behaviour |
| Reverse engineering | `XblAuthManager.dll`, `XblAuthConsoleExt.dll`, API-set mapping |
| Console evidence | authorised dev-mode and devkit observations |
| Client behaviour | official app, web player, open-source clients |
| Emulation | OS image research, TV platform identity |
| Documentation | reproducing experiments, cleaning up write-ups |

## How new contributors help

1. Read [methodology](../docs/methodology.md) and [open questions](../docs/open-questions.md).
2. Pick one question and state the smallest test that would move it.
3. Report results with evidence labels, not conclusions first.
4. Let someone else reproduce it before it becomes a project claim.

## Sharing findings safely

**Do:**

- Describe request shapes by field name, type and length.
- Quote HTTP status codes and error strings.
- Name the process, endpoint, binary and version.
- Attach derived tables, not captures.

**Do not:**

- Post tokens, tickets, cookies, certificates, keys or `.har`/`.saz`/`.xmatcap` files.
- Post account identifiers, gamertags, email addresses or screenshots with them visible.
- Post proprietary binaries or game/OS dumps.
- Post another person's research without permission.

If you are unsure whether something is safe, describe it instead of attaching it. A moderator
will ask for a sanitised version.

## Moderation

- Findings are reviewed before being treated as project claims.
- Claims that cannot be reproduced are labelled **community reported**.
- Credential leaks are removed immediately and the poster is asked to rotate anything exposed.

## Joining

Use the invite: **<https://discord.gg/E65kyCNgSS>**

When you arrive, say which open question you want to work on. Read the pinned rules first;
they repeat the "no credentials, no captures" policy in one screen.
