import type { ParticularActV0 } from "./types";

export interface HelpCaseStatusForBookOfActsV0 {
  schema: "help-case-status/v0";
  caseId: string;
  sourceEnvelopeId: string;
  sourcePayloadHash: string;
  projectedAt: string;
  projectionCut: {
    eventRefs: string[];
    occurrences: Array<{
      eventRef: string;
      type: string;
      occurredAt: string;
    }>;
  };
  requirements: Array<{
    requirementId: string;
    description: string;
    unit?: string;
    requestedQuantity?: number;
    confirmedReceivedQuantity: number;
    resolvedElsewhereQuantity: number;
    waivedQuantity: number;
    confirmedResidualQuantity?: number;
    excessResolvedQuantity: number;
    qualitativeResolved: boolean;
    warnings: string[];
  }>;
}

export interface HelpCaseActDraftCandidateV0 {
  schema: "nuthang.help-case-act-draft/0.1";
  status: "human-review-required";
  source: {
    helpCaseId: string;
    sourceEnvelopeId: string;
    sourcePayloadHash: string;
    statusProjectedAt: string;
    selectedOccurrenceRef: string;
  };
  particular: ParticularActV0;
  compilationPerformed: false;
  reviewRequired: string[];
}

export function prepareHelpCaseActDraft(input: {
  packet: HelpCaseStatusForBookOfActsV0;
  requirementId: string;
  confirmationOccurrenceRef: string;
  actId: string;
  subjectOccurrenceRef: string;
  participants?: ParticularActV0["participants"];
  witnessRefs?: string[];
  communityMemory?: "local" | "named-circle" | "public";
}): HelpCaseActDraftCandidateV0 {
  const {
    packet,
    requirementId,
    confirmationOccurrenceRef,
    actId,
    subjectOccurrenceRef,
  } = input;

  if (packet.schema !== "help-case-status/v0") {
    throw new Error("UNSUPPORTED_HELP_CASE_STATUS");
  }
  if (!actId.trim() || !subjectOccurrenceRef.trim()) {
    throw new Error("HELP_CASE_ACT_IDENTITY_REQUIRED");
  }

  const occurrence = packet.projectionCut.occurrences.find(
    (candidate) => candidate.eventRef === confirmationOccurrenceRef,
  );
  if (!occurrence) {
    throw new Error("HELP_CASE_CONFIRMATION_OCCURRENCE_NOT_FOUND");
  }
  if (occurrence.type !== "receipt.confirmed") {
    throw new Error("BOOK_OF_ACTS_REQUIRES_CONFIRMED_RECEIPT_OCCURRENCE");
  }

  const requirement = packet.requirements.find(
    (candidate) => candidate.requirementId === requirementId,
  );
  if (!requirement) {
    throw new Error("HELP_CASE_REQUIREMENT_NOT_FOUND");
  }
  if (requirement.confirmedReceivedQuantity <= 0 && !requirement.qualitativeResolved) {
    throw new Error("HELP_CASE_REQUIREMENT_HAS_NO_CONFIRMED_RECEIPT");
  }

  const quantitativeResolved =
    requirement.requestedQuantity !== undefined &&
    requirement.confirmedResidualQuantity === 0;
  const scopedComplete =
    requirement.requestedQuantity === undefined
      ? requirement.qualitativeResolved
      : quantitativeResolved;

  const residualFog: string[] = [];
  if (
    requirement.confirmedResidualQuantity !== undefined &&
    requirement.confirmedResidualQuantity > 0
  ) {
    residualFog.push(
      `projected residual remains: ${requirement.confirmedResidualQuantity} ${requirement.unit ?? "unit"}`,
    );
  }
  if (requirement.excessResolvedQuantity > 0) {
    residualFog.push(
      `projected excess resolution remains visible: ${requirement.excessResolvedQuantity} ${requirement.unit ?? "unit"}`,
    );
  }
  residualFog.push(...requirement.warnings.map((warning) => `status warning: ${warning}`));
  residualFog.push(
    "adapter does not infer per-occurrence quantity, participant identity, witness identity, or contemporaneous temporal relation",
  );

  const needRef =
    `help-case:${packet.caseId}:requirement:${requirement.requirementId}`;
  const statusRef = `help-case-status:${packet.sourcePayloadHash}`;

  const particular: ParticularActV0 = {
    schema: "nuthang.particular-act/0.1",
    actId,
    subject: {
      kind: "community-help-requirement",
      ref: needRef,
    },
    needRefs: [needRef],
    offerRefs: [],
    joinRefs: [],
    participants: structuredClone(input.participants ?? []),
    occurrences: [
      {
        occurrenceRef: confirmationOccurrenceRef,
        kind: "receipt.confirmed",
        evidenceClass: "reported",
        sourceRefs: [statusRef, confirmationOccurrenceRef],
      },
    ],
    constraints: [],
    artifactRefs: [],
    witnessRefs: [...(input.witnessRefs ?? [])],
    disposition: scopedComplete ? "scoped_complete" : "partial",
    residualFog,
    disclosure: {
      communityMemory: input.communityMemory ?? "local",
      aiTraining: "not-granted",
    },
    temporalBinding: {
      subjectOccurrenceRef,
      applicationOccurrenceRef: confirmationOccurrenceRef,
      relation: "unresolved",
    },
  };

  return {
    schema: "nuthang.help-case-act-draft/0.1",
    status: "human-review-required",
    source: {
      helpCaseId: packet.caseId,
      sourceEnvelopeId: packet.sourceEnvelopeId,
      sourcePayloadHash: packet.sourcePayloadHash,
      statusProjectedAt: packet.projectedAt,
      selectedOccurrenceRef: confirmationOccurrenceRef,
    },
    particular,
    compilationPerformed: false,
    reviewRequired: [
      "confirm participant references and declared capacities",
      "confirm witness references and evidence class",
      "review residual fog and constraints",
      "resolve temporal binding only if evidence supports it",
      "compile only after explicit human acceptance of the particular",
    ],
  };
}
