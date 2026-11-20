# Emulation research

This document records why "boot the console OS" is not the same as "obtain a trusted Xbox
identity". It does not claim that every hypothetical software design is impossible.

## Xbox OS images

Retail Xbox system images are distributed as encrypted containers. The public `xvdtool`
workflow and development-key paths examined here did **not** produce a verified decrypted,
bootable retail SystemOS.

Even a successful boot would not automatically help: the identity material referenced by
`XblAuthManager.dll` comes from the security processor and console certificate store, not
from the OS image contents. A booted OS without those keys still cannot sign an attestation.

## Security processor

Public research describes the AMD Platform Security Processor as a separate core on the
console die, running Microsoft code, holding keyslots that only PSP code can use. The host
OS reaches it through `psp.sys`. Console certificates are stored in the boot filesystem and
signed in a chain this project did not obtain.

That boundary is the reason the console API set exists at all.

## Samsung / Tizen TV emulator

KI 2 Classic admits `SAMSUNGTV`, so the TV path was investigated separately.

What was done:

- Installed Tizen Studio 10.0 web CLI and the TV Samsung public packages.
- Created a TV emulator VM and attempted to boot it on Apple Silicon.
- Inspected the emulator image's filesystem offline.

Blockers encountered:

| Blocker | Detail |
|---|---|
| Virtualisation check | `em-cli` refuses without HAXM/KVM; bypassing it runs under TCG |
| Graphics init | `vigs_gl_backend_cgl_create_context` fails; device initialisation aborts |
| Headless boot | Kernel boots, init panics (`Attempted to kill init! exitcode=0x00000004`) — the TV init requires graphics/input |
| Documented workaround | QEMU 9.x `emulator-v2` stack absent from this SDK build |

What the image contains:

- Samsung SSO client libraries and services (`libsso_api.so`, `csapi-tv-service-sso`)
- Account services, MSAL assemblies
- `device-certificate-manager` and a hardware-backed `key-manager` trusted application
- DRM services

Samsung documents that the TV emulator lacks SSO and DRM support. That is a vendor statement
about the emulator's limits, not a claim about retail TVs.

**Conclusion:** the TV image carries its own hardware-backed certificate path, and the
emulator is explicitly not a substitute for it. A booted emulator would not mint a
Microsoft-accepted `SAMSUNGTV` identity.

## What is publicly obtainable

| Artifact | Where | Usable? |
|---|---|---|
| OSU update packages (`system.xvd`, `host.xvd`, …) | Microsoft CDN and archive.org mirrors | Encrypted containers; no public retail ODK |
| Dev-mode file dumps | `QuantumTunnel` on a console with a SYSTEM shell | `certkeys.bin` (dev cert) and unmounted files; mounted `system.xvd` cannot be read |
| 2020 "xsec" SDK leak (reported to include Xbox One OS source and keys) | Taken down publicly; circulates privately | Not something this project will source |
| Decrypted firmware stages | 2026 "Bliss" glitch, on hardware | Requires physical glitching |

A full retail HDD dump circulates publicly. It contains the containers and user data, not a
decrypted OS: `system.xvd`/`host.xvd` are encrypted with a retail ODK that is not public. Booting
that OS in a VM (ESXi or otherwise) would still lack the PSP keyslot and the console certificate,
so it would reach the same wall.

Important detail from the Xbox One Research wiki: **dev mode loads the developer keyslot, not the
retail keyslot.** A dev-mode dump therefore does not decrypt retail content, and does not hand
you the retail console identity.

## 2026: the Xbox One boot ROM glitch ("Bliss")

Reported at RE//verse 2026 and covered by Tom's Hardware, Kotaku and Keysight: a voltage
glitch against the Xbox One boot ROM, demonstrated on fat models, achieving supervisor
execution, efuse/key dump and decryption of the early boot stages (SP1, SP2, 2BL, firmware).
Reported as unpatchable on original fat hardware.

**What this changes:** full SystemOS decryption and key extraction is no longer purely
theoretical. That is the route to reading the console-side implementation of
`XblaGetConsoleCert`, `XblaGetAttestation` and the security-processor bridge directly.

**What it does not establish:**

- that the extracted material can produce a device identity Microsoft will accept from a PC;
- that attestation is not bound to the specific console;
- that a cloned identity survives server-side checks.

**Status:** community reported / news, not reproduced here. It requires physical hardware and
invasive modification, and it is outside what this project will ask anyone to do.

See [what-we-need.md](what-we-need.md) for how it ranks as an access route.

## Console emulation projects

Public Xbox One/Series research projects were reviewed for identity work. They document
internals — `xpal.dll` hardware identity exports, `XblAuthConsoleExt.dll` authentication
exports, the security-processor bridge — but none demonstrates obtaining a
Microsoft-accepted retail console identity on a PC.

That is a statement about published evidence, not a proof of impossibility.

## What would actually be needed

A working path would require at least:

1. a console certificate chain accepted by Xbox Live,
2. attestation over boot state that the server can verify,
3. security-processor operations bound to hardware keys,
4. a device record the backend is willing to trust.

Booting an OS provides none of these by itself.

## Why this branch is low priority

- It cannot be tested without prohibited material (encrypted dumps, keys).
- It does not address the actual gate, which is server-side trust.
- It risks drifting into piracy-adjacent territory that this project explicitly avoids.

Recorded as **investigated, not viable with available resources** — not as **impossible**.
