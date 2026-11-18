# Test agent — ZW-only live pilot + wedge (Lock #5)

## Mission

Live pilot is **ZW only**. Other corridors are enums-only. First wedge is UK → ZW **private school fees**.

## Cases

CR-01 .. CR-06

## Procedure

1. ZW KYB + live Connect → allow.
2. NG (or other) live KYB/instruct → reject `corridor_not_live`.
3. Medical/funeral/utilities as first wedge → reject.
4. USD Obligation → allow; ZiG not default.

## Pass / fail

Hard fail if Nigeria (or non-ZW) can go live, or if school fees is not the first wedge.
