# Console attestation

What a real Xbox sends during device authentication, as far as public binaries and schema
show. This is the part a PC cannot simply fabricate.

## The console request builder

`XblAuthManager.dll` (Windows 11 23H2 ARM64, `10.0.22621.2506`) contains a console-specific
branch that serialises a richer `POST /device/authenticate` body than the PC one.

Fields, with the mode that includes them:

| Field | XboxOne | Scarlett | XboxCoreOS | Value source |
|---|---|---|---|---|
| `Attestation` | yes | yes | yes | attestation provider |
| `Certificate` | yes | yes | yes | console certificate getter |
| `PcrAttestation` | no | no | yes | TPM/PCR measurements |
| `DeviceType` | `XboxOne` | `Scarlett` | `XboxCoreOS` | literal |
| `BootLog` | yes | yes | no | console boot log |
| `SP_JWT` | yes | yes | yes | serialised placeholder in this path |
| `EffectiveRegion` | yes | yes | yes | `China` / `None` |

## Producer → context → field

A producer function calls the console getters and stores results into the same object that
the builder later serialises:

| Getter | Context offset | Serialised field |
|---|---|---|
| `XblaGetAttestation` | `+0xc0` | `Attestation` |
| `XblaGetConsoleCert` | `+0x100` | `Certificate` |
| `XblaGetBootLog` | `+0xe0` | `BootLog` (modes 1/2) |
| `XblaGetTpmPcrAttestation` | `+0xe0` | `PcrAttestation` (mode 3) |

Both functions receive the same object pointer; the producer call precedes the builder call.

## Response handling

After the request:

1. HTTP status is checked for `200`.
2. The JSON parser extracts `Token`, `IssueInstant`, `NotAfter`, and `DisplayClaims.xdi.did`.
3. On the non-XboxCoreOS branch, `XblaProcessSpToken` consumes the **returned** token.
4. On another branch, `XblaProcessXcosDeviceToken` does the equivalent.
5. The processed result is stored at object offset `+0x18`; status at `+0x08`.
6. The completion event at `+0x10` is signalled.

**Correction that matters:** `XblaProcessSpToken` is a post-response processor. An earlier
hypothesis that it produced the outbound `SP_JWT` is not supported — the outbound field is
initialised empty on the examined path.

## Nonce and challenge

There is a separate subsystem:

```
/device/nonce  →  object +0xa0  →  challenge handler → XblaProcessChallenge
```

The builder does **not** read `+0xa0`, and no data path from the challenge result into the
device-auth JSON was found. This does not exclude indirect security-processor state changes.

## The boundary: console-only API set

The getters live behind:

```
ext-ms-win-xblauth-console-l1-1-0
```

44 functions including `XblaGetConsoleCert`, `XblaGetAttestation`, `XblaGetBootLog`,
`XblaGetTpmPcrAttestation`, `XblaSignDigest`, `XblaProcessSpToken`,
`XblaProcessXcosDeviceToken`, `XblaIsConsole`, `XblaIsSecurityProcessorPresent`.

Parsing `apisetschema.dll` shows this virtual contract maps to an **empty host** on stock
desktop Windows (ARM64 and x64 builds checked). That is stronger than "the DLL is missing":
the contract exists in the schema with no implementation.

**Verified:** desktop Windows cannot resolve these entry points from a stock image.

**Inferred:** they are implemented by console SystemOS and the security processor.

## Security processor

Public research describes the AMD Platform Security Processor on the Xbox die as a separate
core running Microsoft code, holding keyslots that only PSP code can use, contacted by the
host OS through `psp.sys`. A boot chain and certificate hierarchy sit outside the reach of a
PC process.

That is the reason booting an Xbox OS image is not equivalent to obtaining an identity: the
keys and the attestation live below the OS.

## What remains unknown

- The exact validation rule. Nobody in this project has observed the server accepting or
  rejecting a genuine console attestation.
- Whether attestation is sufficient, or whether the server also requires a console record
  registered to the account.
- How `EffectiveRegion` and `SP_JWT` influence the decision.

## Why dummy fields fail

Sending `XboxOne` with filler `Attestation`, `Certificate`, `BootLog`, `SP_JWT` and
`EffectiveRegion` still returns `400` with an empty body. Whatever the server checks, it is
not satisfied by field presence or shape.

See [reverse-engineering.md](reverse-engineering.md) for addresses and corrections.
