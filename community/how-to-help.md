# How to help

The most valuable contribution is **reproducible evidence**, not an opinion about whether a
bypass should exist.

## High-value work right now

### 1. Catalogue drift watch (no account risk beyond normal use)

Re-scan the web and console offerings daily and record whether the restricted titles are
listed. This answers whether the 2026-11-20 change is permanent.

**Report:** date, offering, title count, restricted entries, allowlists.

### 2. Public-source review

Pick one open-source client or research repository and document what it actually sends during
authentication and session start. Many projects repeat each other's claims; check the code.

**Report:** file and function references, field names, and whether any console identity logic
exists.

### 3. Static analysis

If you can analyse public binaries, compare the console provider exports documented by the
Xbox research community with the call sites already mapped here. State which are verified and
which are speculation.

**Report:** binary version, addresses, function names, evidence level.

### 4. Authorised console observation

If you own a console with developer mode, determine whether system-level
`/device/authenticate` traffic is visible through console network tooling. Record **field
names, certificate metadata categories, status codes** — never tokens or keys.

### 5. Samsung TV validation

KI 2 Classic allows `SAMSUNGTV`. A TV owner can answer a question nobody here can: does a
real TV actually start the title? GTA VI does not allow TVs, so this is a separate branch.

**Report:** TV model, region, whether the session started, and the error string if not.

## What a useful report contains

1. **Question** — the single thing you tested.
2. **Conditions** — client, version, offering, region, account entitlement status (yes/no,
   never the identifier).
3. **Method** — what you sent or observed, by field name.
4. **Result** — status code, error string, token claim categories.
5. **Evidence level** — verified / tested / community reported / inferred.
6. **Limits** — what the test does not prove.

## What not to send

- Tokens, tickets, certificates, keys, cookies.
- Captures (HAR/SAZ/XMAT), even "cleaned" ones.
- Account identifiers or personal data.
- "It works" without a reproducible description.
- Requests to help bypass a specific account's restriction.

## Review before publishing

Anything that would become a project claim goes through:

1. reproduction by a second person, or
2. clear static evidence, or
3. an explicit **community reported** label.

That is the whole quality bar. It is low ceremony and high signal.
