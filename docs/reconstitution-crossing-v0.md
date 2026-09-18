# Reconstitution Crossing v0

This is an **experimental Jubilee-side crossing specimen** between Book of Acts and the Seedbank / ELF frontier.

It does not make Jubilee Engine VM the owner of Seedbank, ELF, ARK, Storyship, Human-Witness, or runtime authority semantics. It only tests one narrow claim at their boundary:

> Attributable material may cross and support local capability reconstitution while authority remains constituted by the receiving environment.

## Executable flow

```text
ParticularActV0
  -> verified ActReceiptV0
  -> ReconstitutionSeedV0
  -> transit as information
  -> local admission
  -> fresh ReconstitutionEventV0
  -> new particular
  -> local authority grant, if any
  -> action decision
```

There is deliberately **no identity edge** from a source creature to the resulting particular.

## Frozen grocery-helper specimen

The source is the Book of Acts grocery-delivery fixture. The seed carries:

- bounded grocery-helper instructions
- capability reference
- schema references
- hostile-test references
- source act reference
- residual formation trace

It may also carry arbitrary strings that *claim* authority. Those strings remain transported information only.

The receiving environment separately admits a capability reference and separately grants authority for a bounded action.

Without a local grant:

```text
CAPABILITY: available
AUTHORITY: absent
ACTION: blocked
```

With a matching local grant:

```text
CAPABILITY: available
AUTHORITY: locally-granted
ACTION: permitted
```

## Hostile boundary

The central negative control is intentional:

```text
seed.transportedAuthorityClaims = ["authority:granted", "purchase-groceries"]

effectiveAuthorityGrants = []
```

The transported claim is preserved as attributable input but acquires no destination power.

## Current law

```text
history != authority
receipt != permission
knowledge != permission
capability != permission
same seed != same particular
reconstitution != inherited legitimacy
```

**THE SEED CROSSES. THE CROWN DOES NOT.**
