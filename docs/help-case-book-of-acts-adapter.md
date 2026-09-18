# Help Case → Book of Acts adapter

A returned help-case status may prepare an optional Book of Acts particular for
human review.

The adapter requires an explicitly selected `receipt.confirmed` occurrence. A
`delivery.reported` occurrence is refused.

It carries the selected requirement, current residual fog, source status
lineage, caller-supplied participant/witness references, and an unresolved
temporal binding into a `ParticularActV0` draft.

The adapter deliberately stops there:

```text
confirmed occurrence
  -> draft particular
  -> HUMAN REVIEW
  -/-> automatic compile
```

The downstream compiler is not invoked. No receipt, block, token, value,
reputation, authority, or training permission is created by this adapter.

Because `help-case-status/v0` does not contain per-occurrence quantity or
participant identity, the adapter does not invent either. The human reviewer may
supply attributable participant and witness references before choosing whether
the particular deserves compilation.
