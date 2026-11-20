# Open questions

Ordered by how much they would change the picture, not by difficulty.

## Q1. What exactly does the backend accept?

Is a genuine console attestation sufficient on its own, or does the server also require a
console record registered to the account?

- **Would answer:** an authorised capture of a successful console device-auth and the
  resulting session authorisation.
- **Blocker:** hardware.

## Q2. Does the official Windows RPS token reach XSTS, and with what class?

The service issues a JWE device token. Does the app or identity stack present it to XSTS, and
does the resulting GSSV token carry a device class?

- **Would answer:** a signed-in official client with a status/claim-only trace.
- **Blocker:** interactive sign-in with the entitled account.
- **Note:** even a positive result would not produce a console class.

## Q3. Is the catalogue filter per-account or global?

On 2026-11-20 the web offering stopped listing the restricted titles. Is that a permanent
change, a launch-window rollout, or account-specific?

- **Would answer:** re-scan `xgpuweb` over several days and with a second account.
- **Blocker:** none, just time.

## Q4. Does the console catalogue consume the device claim?

Tested with a `Win32` token: no difference. Would a console-class token change the listing?

- **Would answer:** impossible to test without a console token. Current evidence says the
  filter is per offering.

## Q5. Would a title allowing `ANDROID` or `IOS` behave differently?

Such a title would isolate whether the check is a literal set membership on `devicetype`.

- **Would answer:** a catalogue scan for any allowlist containing a non-console class.
- **Status:** none found in 2,400+ titles.

## Q6. Can a retail Samsung TV actually start KI 2 Classic?

The allowlist says yes; behaviour was never observed.

- **Would answer:** a TV owner running the test and reporting the session result.
- **Scope:** KI 2 Classic only; GTA VI does not allow `SAMSUNGTV`.

## Q7. How does `EffectiveRegion` affect the decision?

The console builder emits `China` or `None`. Its server-side meaning was not investigated.

- **Would answer:** console-side testing across regions.

## Q8. Is the JWE device class stable across hardware?

The Windows token is unreadable, but its downstream effects might be observable with
different `DeviceModel` values on the same account.

- **Would answer:** controlled experiments changing hardware model strings on the RPS path
  (which the client derives from hardware) — requires driver-level work, not planned.

## Q9. What does `XblaProcessXcosDeviceToken` do differently?

Two processing paths exist for two console generations. Which fields differ server-side is
unknown.

- **Would answer:** console firmware analysis beyond what public research documents.
