import { sha256Content } from "../bookOfActs/canonicalize";
import type { ActReceiptV0, ParticularActV0 } from "../bookOfActs/types";
import { verifyActReceipt } from "../bookOfActs/verifyReceipt";
import type {
  ActionDecisionV0,
  LocalAdmissionV0,
  LocalAuthorityGrantV0,
  ReconstitutionEventV0,
  ReconstitutionSeedCargoV0,
  ReconstitutionSeedV0,
} from "./types";

export const RECONSTITUTION_PROFILE =
  "nuthang/reconstitution-crossing/v0" as const;

export const RECONSTITUTION_NON_CLAIMS = Object.freeze([
  "seed != identity continuity",
  "seed != authority",
  "receipt != authority",
  "knowledge != permission",
  "capability != permission",
  "reconstitution != inherited legitimacy",
  "seed != AI training consent",
] as const);

function sortedUnique(values: string[]): string[] {
  return Array.from(new Set(values)).sort();
}

function normalizeCargo(
  cargo: ReconstitutionSeedCargoV0,
): ReconstitutionSeedCargoV0 {
  return {
    instructions: [...cargo.instructions],
    capabilityRefs: sortedUnique(cargo.capabilityRefs),
    schemaRefs: sortedUnique(cargo.schemaRefs),
    testRefs: sortedUnique(cargo.testRefs),
    exampleActRefs: sortedUnique(cargo.exampleActRefs),
    formationTrace: [...cargo.formationTrace],
  };
}

function seedBody(seed: Omit<ReconstitutionSeedV0, "seedId">) {
  return seed;
}

async function expectedSeedId(
  seed: ReconstitutionSeedV0,
): Promise<string> {
  const { seedId: _seedId, ...body } = seed;
  return sha256Content(seedBody(body));
}

export async function createReconstitutionSeed(input: {
  act: ParticularActV0;
  receipt: ActReceiptV0;
  cargo: ReconstitutionSeedCargoV0;
  transportedAuthorityClaims?: string[];
}): Promise<ReconstitutionSeedV0> {
  const verification = await verifyActReceipt(input.receipt, input.act);
  if (verification.status !== "VALID") {
    throw new Error("SOURCE_RECEIPT_NOT_VALID");
  }

  if (input.cargo.capabilityRefs.length === 0) {
    throw new Error("SEED_REQUIRES_CAPABILITY_REF");
  }

  const body = {
    schema: "nuthang.reconstitution-seed/0.1" as const,
    profile: RECONSTITUTION_PROFILE,
    sourceActId: input.act.actId,
    sourceActDigest: input.receipt.actDigest,
    sourceReceiptRefs: [input.receipt.receiptId],
    cargo: normalizeCargo(input.cargo),
    transportedAuthorityClaims: sortedUnique(
      input.transportedAuthorityClaims ?? [],
    ),
    doesNotClaim: [...RECONSTITUTION_NON_CLAIMS],
  };

  return {
    ...body,
    seedId: await sha256Content(seedBody(body)),
  };
}

export async function hatchSeed(input: {
  seed: ReconstitutionSeedV0;
  hatchOccurrenceRef: string;
  environmentRef: string;
  targetRef: string;
  localAdmissions?: LocalAdmissionV0[];
  localAuthorityGrants?: LocalAuthorityGrantV0[];
  residuals?: string[];
}): Promise<ReconstitutionEventV0> {
  if ((await expectedSeedId(input.seed)) !== input.seed.seedId) {
    throw new Error("SEED_IDENTITY_MISMATCH");
  }

  if (!input.hatchOccurrenceRef.trim()) {
    throw new Error("HATCH_OCCURRENCE_REQUIRED");
  }
  if (!input.environmentRef.trim()) {
    throw new Error("ENVIRONMENT_REQUIRED");
  }
  if (!input.targetRef.trim()) {
    throw new Error("TARGET_REQUIRED");
  }

  const localAdmissions = [...(input.localAdmissions ?? [])]
    .map((admission) => ({ ...admission }))
    .sort((left, right) => left.admissionRef.localeCompare(right.admissionRef));

  for (const admission of localAdmissions) {
    if (!input.seed.cargo.capabilityRefs.includes(admission.capabilityRef)) {
      throw new Error("LOCAL_ADMISSION_REFERENCES_UNKNOWN_CAPABILITY");
    }
  }

  const effectiveAuthorityGrants = [...(input.localAuthorityGrants ?? [])]
    .map((grant) => ({ ...grant }))
    .sort((left, right) => left.grantRef.localeCompare(right.grantRef));

  const eventBody = {
    schema: "nuthang.reconstitution-event/0.1" as const,
    profile: RECONSTITUTION_PROFILE,
    seedId: input.seed.seedId,
    sourceReceiptRefs: [...input.seed.sourceReceiptRefs],
    hatchOccurrenceRef: input.hatchOccurrenceRef,
    environmentRef: input.environmentRef,
    targetRef: input.targetRef,
    localAdmissions,
    effectiveAuthorityGrants,
    transportedAuthorityClaims: [...input.seed.transportedAuthorityClaims],
    identityRelation: "new-particular" as const,
    claims: {
      informationCrossed: true as const,
      authorityInherited: false as const,
      identityContinued: false as const,
    },
    residuals: [...(input.residuals ?? [])],
  };

  const eventId = await sha256Content(eventBody);

  return {
    ...eventBody,
    eventId,
    resultingParticularRef: `particular:${eventId.slice("sha256:".length)}`,
  };
}

export function evaluateAction(
  event: ReconstitutionEventV0,
  input: {
    capabilityRef: string;
    action: string;
  },
): ActionDecisionV0 {
  const capabilityAvailable = event.localAdmissions.some(
    (admission) => admission.capabilityRef === input.capabilityRef,
  );

  const matchingGrant = event.effectiveAuthorityGrants.find(
    (grant) =>
      grant.action === input.action &&
      grant.targetRef === event.targetRef,
  );

  const authorityPresent = Boolean(matchingGrant);

  return {
    capability: capabilityAvailable ? "available" : "unavailable",
    authority: authorityPresent ? "locally-granted" : "absent",
    action:
      capabilityAvailable && authorityPresent
        ? "permitted"
        : "blocked",
    capabilityRef: input.capabilityRef,
    requestedAction: input.action,
    ...(matchingGrant ? { matchedGrantRef: matchingGrant.grantRef } : {}),
  };
}
