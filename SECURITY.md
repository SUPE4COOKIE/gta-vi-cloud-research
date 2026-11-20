# Security policy

## Scope

This repository documents authentication research. It does **not** contain credentials and
must never contain them.

## Reporting a sensitive finding

If you discover something that could be abused — a leaked token in the repository, a
credential in a screenshot, a script that stores secrets, or a finding that should not be
public yet:

1. **Do not open a public issue.**
2. Contact the maintainer privately through the Discord server:
   <https://discord.gg/E65kyCNgSS> (maintainer: **sixstar**).
3. Describe the issue without including the secret itself.

If you believe a credential has been exposed, rotate it immediately:

- Microsoft account: sign out of all devices and change the password.
- Xbox/Microsoft tokens: revoke sessions from the account security page.

## What we will never ask for

- Your password or MFA code.
- Your refresh token, access token or device token.
- Your console certificate, private key or attestation blob.
- Access to your Microsoft account.

Any message asking for these is not from this project.

## Handling of captures

Raw captures (HAR, SAZ, `.xmatcap`, packet dumps) frequently contain bearer tokens, cookies
and account identifiers. They are **out of scope for this repository**, even when they look
sanitised.

If you need to share evidence, publish:

- field names, types and lengths,
- HTTP status codes and error strings,
- process names and endpoint paths,
- derived tables.

## Local testing safety

If you reproduce the WinHTTP capture work:

- record the original proxy configuration first,
- restore it afterwards (`netsh winhttp reset proxy` if it was direct),
- remove any temporary root CA from `LocalMachine\Root`,
- delete keys, PFX files and logs,
- verify normal connectivity before you stop.

A left-behind interception CA is a real risk to the machine's owner.

## Supported versions

There are no releases. The repository is a living research log; only the current default
branch is maintained.
