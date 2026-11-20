# Evidence directory

This directory is intentionally almost empty. It holds **derived, sanitized** tables, not raw
captures.

## What may be committed

- Aggregated counts (titles scanned, restricted entries, status-code tables).
- Sanitized request/response **schemas** — field names, types and lengths.
- Offline analysis output that contains no proprietary bytes.
- Diagrams generated from findings.

## What must never be committed

- Access tokens, refresh tokens, device tokens, XSTS or GSSV tokens.
- Cookies, session identifiers, XUIDs, gamertags, email addresses.
- Certificates, private keys, PFX files, CA material.
- RPS tickets or any string lifted from a live authentication request.
- Full HTTP captures (HAR, SAZ, `.xmatcap`, Fiddler/FiddlerCore sessions).
- Xbox or Windows binaries, OS images, game dumps.
- Screenshots containing account names, tokens or personal data.

## Naming

If you add a derived table:

```
evidence/<experiment-id>-<short-name>.md
```

with a header stating:

1. the experiment ID,
2. the date of the run,
3. what was measured,
4. what was removed,
5. how to reproduce without capturing credentials.

## Why so strict

A single leaked refresh token can hand over an account. A published capture can leak another
person's identity even if the author thinks it is anonymous. When in doubt, describe the
result instead of attaching the artifact.
