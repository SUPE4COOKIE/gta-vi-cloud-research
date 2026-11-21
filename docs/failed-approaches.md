# Failed approaches

Each of these was tried, or is commonly suggested, and did not work. They are listed so the
next person does not repeat them.

## 1. Client metadata spoofing

**Tried:** ~250 combinations of user agent, `X-MS-Device-Info`, `x-gssv-client`, `sdkType`,
`osName`, model strings, markets, API versions, Samsung and Fire TV metadata.

**Result:** at the time (2026-11-19), every session start for KI 2 Classic returned `400 DeviceTypeNotAllowed`.

**Why it fails:** the device class is not read from client-advertised metadata. It arrives
through the authenticated device token.

**Caveat:** this does not prove no software approach can ever work; it proves these fields
are not the lever.

## 2. Requesting a console device type

**Tried:** `XboxOne`, `Xbox`, `Scarlett`, `XBOXONE`, `SCARLETT`, `SAMSUNGTV`, `Durango`,
`XboxOneX`, `XboxSeriesS`, `WindowsOneCore`, `Tizen`, `AndroidTV`, `FireTV`, `Devkit`,
`SmartTV` and more, with PoP and RPS auth methods.

**Result:** `400` with an empty body; `Win32`/`Android`/`iOS` return `200`.

**Why it fails:** without attestation the issuer has nothing to match the declared class against.
Signature validity was checked separately, so this is not a malformed request. **Refined
2026-11-21:** the console endpoint is a separate five-field branch, and a matching attestation does
return `200` — see [console attestation](console-attestation.md).

## 3. Adding console fields to a console request

**Tried:** `XboxOne` and `XboxCoreOS` requests carrying filler `Attestation`, `Certificate`,
`BootLog`/`PcrAttestation`, `SP_JWT` and `EffectiveRegion`.

**Result:** still `400`, same empty body.

**Why it fails:** the console branch takes exactly five fields and no signature; the extra desktop
fields make an otherwise valid request fail. **Confirmed 2026-11-21** by ablation with a real
attestation: adding `Nonce`, `SP_JWT`, or `AuthMethod`/`ProofKey` turns `200` into `400`.

## 4. Using the PC-app offering

**Tried:** reading the `XGPUPCAPP` catalogue and looking for a start action.

**Result:** both restricted titles are absent from that offering.

**Why it fails:** the filter happens at catalogue build time, before any device check.

## 5. Booting an emulated console OS

**Tried:** reviewing public Xbox OS image research and attempting a Tizen TV emulator boot.

**Result:** retail images remain encrypted; the TV emulator fails on virtualisation and
graphics, and Samsung documents that it lacks SSO/DRM.

**Why it fails:** the identity is below the OS, in the security processor and certificate
store. Booting an OS does not mint keys.

## 6. Browser user-agent tricks

**Tried:** console user agents in the web player, as popularised by various tools.

**Result:** no restricted session. The web catalogue now does not even list the titles.

**Why it fails:** same reason as (1).

## 7. Assuming a successful login means a working bypass

**Observed in community reports:** an `XGPUCONSOLE` sign-in succeeded on PC and the title
still returned `DeviceTypeNotAllowed`.

**Why it is a trap:** login and session authorisation are different gates. A token that
exists is not a token that is trusted for a restricted title.

## 8. Old clients, legacy paths and non-production hosts

Community-tested (not by this project), all without a successful session:

- the oldest Android xCloud builds, which use the same endpoints and hosts
- legacy API paths
- non-production hosts
- the Samsung TV flow with Xbox headers

Recorded as **community reported**. Useful because it closes the "maybe an older client had a
different rule" theory.

## 9. Request-shape probing (community tested)

- `/device/authenticate` with random tokens padded to the same length as a real one
- `beta-device` and other host variants
- combinations of `offerId`, test and pre-production `/play` endpoints
- Samsung TV flow with Xbox headers, taken from reverse-engineered firmware

All reported as unsuccessful. Recorded as **community reported**; the exact status codes were
not shared.

## 10. DNS-level observation

Logging the console's DNS queries shows hostnames only. During a launch, a tester saw delivery
and store hosts but no auth host — the token was already cached. DNS cannot show paths,
headers, or bodies. Useful for mapping, not for capturing the exchange.

## 11. Reading the encrypted device token

**Tried:** inspecting the official Windows device token.

**Result:** it is a JWE (`alg`, `enc`, `zip`, `x5t`, `cty`) addressed to a recipient we do
not control.

**Why it fails:** without the recipient key there is nothing to read. Treating the `200` as
proof of a console class would be wrong.

## What is *not* on this list

- A real console capture — untested, not failed.
- A real Samsung TV test — untested, not failed.
- The exact server acceptance rule — unknown, not disproven.

Do not convert "we did not get it" into "it is impossible".
