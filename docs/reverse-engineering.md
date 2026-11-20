# Reverse engineering

Static analysis of the Windows component that builds device-authentication requests.

## Binary

| Field | Value |
|---|---|
| File | `XblAuthManager.dll` |
| Source | Official Windows 11 23H2 ARM64 installation media |
| Version | `10.0.22621.2506` |
| Architecture | ARM64 |
| Source path string | `onecoreuap\xbox\xblauth\lib\deviceauthenticator.cpp` |

Addresses below are **RVAs** unless written as full `0x180...` virtual addresses.

## Control flow (verified)

```
0xa4cb0  COM-style method
         mov x20, x0                  ; this
         QueueUserWorkItem(0xa28e0, this, 0)
              |
0xa28e0  threadpool callback → 0xa2770
              |
0xa2a30  producer: calls console getters, fills the object
              |
0xa2d80  builder: serialises /device/authenticate
              |
         response Token → XblaProcessSpToken / XblaProcessXcosDeviceToken
              |
         result → object+0x18, status → +0x08, SetEvent(+0x10)
```

The queued context is the COM instance itself (`x20 := x0`), not a separate allocation. This
was confirmed at `0x1800a4cc8` and by the `QueueUserWorkItem` call.

## Object fields

| Offset | Producer | Role |
|---|---|---|
| `+0x08` | completion handler | status |
| `+0x10` | completion handler | event handle |
| `+0x18` | processed response token | result slot |
| `+0xa0` | `/device/nonce` handler | nonce for the challenge subsystem |
| `+0xc0` | `XblaGetAttestation` | `Attestation` |
| `+0xe0` | `XblaGetBootLog` / `XblaGetTpmPcrAttestation` | `BootLog` / `PcrAttestation` |
| `+0x100` | `XblaGetConsoleCert` | `Certificate` |

## API-set boundary

Delay-load imports from `ext-ms-win-xblauth-console-l1-1-0` (44 functions). Two independent
checks agree that this contract has no implementation on desktop Windows:

1. Parsing `apisetschema.dll` from the installation media yields an **empty host** for the
   virtual DLL. The parser was sanity-checked against 963 ordinary mappings.
2. A full media listing contains no file of that name.

This is stronger than "the DLL is absent": the schema declares the contract with no host.

## Corrections made during the work

These are recorded because each one changed a conclusion.

| Earlier claim | Status | Correction |
|---|---|---|
| The RVA list near `0x1800cb49d` is an RPC dispatch table | **Disproved** | It lies inside the PE Control Flow Guard table (`GuardCFFunctionTable 0x1800ca688`, 880 entries, stride 5) |
| The async callback is unreachable | **Disproved** | It is registered with `QueueUserWorkItem` by the COM method |
| `XblaProcessSpToken` produces the outbound `SP_JWT` | **Not supported** | The field's value slot is zero-initialised; the call consumes the **response** token |
| Delay imports must have per-import stubs | **Disproved** | Resolved pointers are loaded with `LDAR`, not `LDR`; the earlier scanner missed 48 call sites |
| Nonce feeds the device-auth body | **Not found** | The builder does not read `+0xa0`; the path is separate |

Publishing corrections is part of the method. A confident wrong answer is worse than an
open question.

## Response parsing

The parser extracts `Token`, `IssueInstant`, `NotAfter` and `DisplayClaims.xdi.did`. The
`Token` is passed to `XblaProcessSpToken` / `XblaProcessXcosDeviceToken`; the processed
value lands in the object for a consumer outside this DLL's statically reachable graph.

The consumer is reached through an asynchronous completion event, so it is not traceable
without the owning component.

## What this proves, and what it does not

**Proven:** desktop Windows contains the *code* for console authentication but not the
*provider*. The request builder, the field set, the getters and the completion path all
exist; the implementation behind the API set does not.

**Not proven:** that KI 2 Classic's server-side authorisation specifically invokes this
console path. That is inference from the allowlist, not an observed server decision.

## Reproducing

The binary is Microsoft-proprietary. Do not redistribute it. Reproduce by extracting it from
official media into a local scratch directory and repeating the analysis; publish addresses
and findings, not the file.
