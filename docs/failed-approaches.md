# Failed approaches

Each of these was tried, or is commonly suggested, and did not work. They are listed so the
next person does not repeat them.

## 1. Client metadata spoofing

**Tried:** ~250 combinations of user agent, `X-MS-Device-Info`, `x-gssv-client`, `sdkType`,
`osName`, model strings, markets, API versions, Samsung and Fire TV metadata.

**Result:** every session start for KI 2 Classic returned `400 DeviceTypeNotAllowed`.

**Why it fails:** the device class is not read from client-advertised metadata. It arrives
through the authenticated device token.

**Caveat:** this does not prove no software approach can ever work; it proves these fields
are not the lever.

## 2. Requesting a console device type

**Tried:** `XboxOne`, `Xbox`, `Scarlett`, `XBOXONE`, `SCARLETT`, `SAMSUNGTV`, `Durango`,
`XboxOneX`, `XboxSeriesS`, `WindowsOneCore`, `Tizen`, `AndroidTV`, `FireTV`, `Devkit`,
`SmartTV` and more, with PoP and RPS auth methods.

**Result:** `400` with an empty body; `Win32`/`Android`/`iOS` return `200`.

**Why it fails:** the issuer does not hand out console classes to unauthenticated clients.
Signature validity was checked separately, so this is not a malformed request.

## 3. Adding console fields to a console request

**Tried:** `XboxOne` and `XboxCoreOS` requests carrying filler `Attestation`, `Certificate`,
`BootLog`/`PcrAttestation`, `SP_JWT` and `EffectiveRegion`.

**Result:** still `400`, same empty body.

**Why it fails:** the server is not satisfied by field presence. It is checking material a PC
cannot produce.

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

## 9. Reading the encrypted device token

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
