# Contributing

Thanks for taking this seriously. This project is a research log, not a product, and the
quality bar is evidence.

## Before you start

1. Read [docs/methodology.md](docs/methodology.md) — every claim carries an evidence label.
2. Read [docs/open-questions.md](docs/open-questions.md) — pick a question, not a vibe.
3. Read [docs/failed-approaches.md](docs/failed-approaches.md) — do not repeat a known
   negative result without a new hypothesis.

## Areas that need work

| Area | What is useful |
|---|---|
| Xbox Live authentication | Claim propagation, device-token behaviour, offering differences |
| Reverse engineering | Static analysis of public binaries and schema files, with addresses |
| Public-source analysis | What open clients actually send, verified in code |
| Authorised dev-mode research | Observations from hardware you own, sanitised |
| Cloud-session protocol | Session lifecycle, queue, authorisation stages |
| Emulation and compatibility | Why booting an OS does not mint an identity |
| Reproducibility | Re-running an existing experiment and confirming the result |

## Ground rules

- **No credentials.** Tokens, tickets, cookies, certificates, private keys, account
  identifiers and captures are never committed, pasted in issues, or attached to reviews.
- **No purchases on the project's behalf.** Do not buy titles to "check" a gate.
- **No unauthorised access.** Only test accounts and hardware you control.
- **No flooding.** One well-chosen request beats a sweep. Respect rate limits.
- **No "it works" without a method.** A screenshot of a game card is not a session.

## What a good pull request contains

1. The question it answers.
2. The method, with field names and status codes.
3. The result, labelled with an evidence level.
4. The limits of the result.
5. Documentation updated in the right file under `docs/`.

Documentation changes are as welcome as code. Corrections with references are especially
welcome — this project has published several corrections to its own earlier claims.

## Reporting format

Use the issue templates:

- **Research finding** — a result, a reproduction, or a correction.
- **Bug report** — something in the repository (broken link, wrong claim, invalid script).

Include the date of any catalogue or service observation. Service behaviour changes.

## Privacy

If a finding requires account state, report only:

- entitled: yes/no
- offering: name
- region: name
- result: status code and error string

Never the account, gamertag, XUID, email or token.

See [SECURITY.md](SECURITY.md) for sensitive disclosures.

Maintainer: **sixstar** · Community: <https://discord.gg/E65kyCNgSS>

## Licence

This project is released under the **MIT License** — see [LICENSE](LICENSE).

By contributing you agree that your contribution is licensed under the same terms. Do not
submit material you cannot license (third-party code, proprietary binaries, captures).
