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

## Console binaries (verified, 2026-11-21)

The retail HDD dump contains the actual console DLLs. Extracted read-only:

```
XblAuthConsoleExt.dll   76 KB   42 exports
XblAuthManager.dll      1.2 MB  1 export (ServiceMain)
XblAuthManagerProxy.dll 116 KB
XblAuthTokenBrokerExt.dll 132 KB
xboxcloudstreaming.dll  740 KB
xboxlivetitleid.dll      64 KB
```

`XblAuthConsoleExt.dll` imports `DeviceIoControl`, `bcrypt`, `XCRDAPI` and `XboxLiveTitleId`.
It contains **no embedded keys or certificate material**. Its exports include the expected
getters plus `XblaCopyProxyAndCertFilesFromUSB`, `XblaAllowUsbCertAndProxy`,
`XblaResetSmcReloadAlgorithm` and capability-certificate helpers.

`XblAuthManager.dll` (console build) loads `ext-ms-win-xblauth-console-l1-1-0.dll` and references
`XblaGetConsoleCert` / `XblaGetAttestation`, exactly as the desktop build does.

**Conclusion:** the console binary is a user-mode wrapper over a device/driver path. The signing
keys are below it, not inside it. Extracting the DLLs does not yield an identity — but the
devkit-only USB proxy/cert path is now confirmed as a real capture route.

## Dev Mode, measured (community capture, 2026-11-21)

A retail Series S in Dev Mode, with a trusted CA installed, produced full-TLS captures of the
sign-in path. The OS `AuthManager` service — not the app — performs device auth, so the
app-level stub is irrelevant to what the network sees:

| Request | Result |
|---|---|
| `device.auth`, `DeviceType: Win32`, `TokenType: JWT`, 426 B body | `200`, JWE ~1.7 KB |
| `device.auth`, `DeviceType: Xbox`, same shape, 425 B body | `400`, **empty** |
| `device.auth`, `DeviceType: Scarlett`, `TokenType: SP_JWT`, 2,963 B body | `200`, JWE 3,537–3,539 B |
| `xsts/authorize` for **RETAIL** using that device token | `401`, XErr `2148916249` (`0x8015DC19`) |

Rows 1–2 are a one-field control: same branch, 425 vs 426 bytes, only the type value differs.
That settles the **schema** argument: the request shape is fine.

It does **not** settle the class gate on its own. Repeating our dummy body with `Win32`,
`XboxOne`, `Xbox`, `Scarlett` and `Banana` returns `200` only for `Win32` and an identical empty
`400` for the rest — including the nonsense string. From a PC, "wrong class" and "invalid type"
are indistinguishable. Only the console's `200` on real material separates them.

`TokenType` is also part of the pair: `Win32` + `SP_JWT` returns `400`, and so does `Scarlett` +
`JWT`. The verifier is reached only by `console type + SP_JWT`.

Row 3 **corrects our earlier reading**. A console type is accepted when the request carries real
attestation material and `TokenType: SP_JWT`. Filler blobs were never going to pass; the issuer
checks the material, not the field names.

Row 4 is the new wall: a token minted in the **Dev Mode sandbox** is refused by XSTS for RETAIL.
Sandbox binding, device-record mismatch and freshness are all still possible explanations — see
Q10 in `open-questions.md`.

Two corrections to the earlier binary reading:

- `XblaProcessChallenge` is E_NOTIMPL in the **app's copy** of `XblAuthConsoleExt.dll`. The
  system service still performs the call successfully. "The arm cannot be exercised from a
  dev-mode app" is right; "Dev Mode cannot mint a console token" is **wrong**.
- `XblaSignDigest` remains a shim. No local signing primitive was found.

A useful side observation: the XSTS request grows by ~1.7 KB when a device token is included, so
body size alone tells you whether a capture presented one.

### Retail apps cannot start in Dev Mode (measured twice)

`POST /api/taskmanager/app` for `Microsoft.xCloudConsole2…` returns `400` with
`ErrorCode -2147219196` (`0x80040904`); the same call for Edge returns `0x8004090a`. Neither app
ran in 60 follow-up checks, and the Dev Mode home has no Game Pass or Cloud tiles.

That closes the "launch the xCloud app in Dev Mode and capture the play call" idea. The auth
traffic is real and capturable because it comes from system services, not from the retail app.

## Other console artifacts (checked 2026-11-21)

| Artifact | Result |
|---|---|
| NAND image (4.9 GB) | Mostly empty; no plaintext `certkeys`, `sp_s.cfg`, or console certificate |
| Devkit recovery VHD | No plaintext `XblAuthConsoleExt`, `certkeys`, or `XblAuthManager` strings |
| `xsec` source leak | Contains DevAuth v2, which is **accessory** authentication (Indium chip certificates), not console-to-Live identity |
| GDK SDK | Installer CABs; no auth implementation |

The only readable artifact remains the retail HDD dump.

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
