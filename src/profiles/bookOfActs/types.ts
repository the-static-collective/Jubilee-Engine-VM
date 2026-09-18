import type { CompilerIdentity } from "../../lib/jubilee";

export type EvidenceClassV0 =
  | "observed"
  | "reported"
  | "derived"
  | "unresolved";

export type ActDispositionV0 =
  | "attempted"
  | "partial"
  | "scoped_complete"
  | "refused"
  | "composted"
  | "unresolved";

export type DisclosurePolicyV0 = {
  communityMemory: "local" | "named-circle" | "public";
  aiTraining: "not-granted";
};

export type TemporalBindingV0 = {
  subjectOccurrenceRef: string;
  declarationOccurrenceRef?: string;
  applicationOccurrenceRef: string;
  relation: "contemporaneous-attested" | "retrospective" | "unresolved";
};

export type ParticularActV0 = {
  schema: "nuthang.particular-act/0.1";
  actId: string;
  subject: { kind: string; ref: string };
  needRefs: string[];
  offerRefs: string[];
  joinRefs: string[];
  participants: Array<{
    actorRef: string;
    declaredCapacity?: string;
    contributionRefs: string[];
  }>;
  occurrences: Array<{
    occurrenceRef: string;
    kind: string;
    evidenceClass: EvidenceClassV0;
    sourceRefs: string[];
  }>;
  constraints: Array<{
    constraintRef: string;
    kind: string;
    sourceRefs: string[];
  }>;
  artifactRefs: string[];
  witnessRefs: string[];
  disposition: ActDispositionV0;
  residualFog: string[];
  disclosure: DisclosurePolicyV0;
  temporalBinding: TemporalBindingV0;
};

export type ActReceiptV0 = {
  schema: "nuthang.act-receipt/0.1";
  receiptId: string;
  actDigest: string;
  profile: "nuthang/book-of-acts/v0";
  compilerIdentity: CompilerIdentity;
  compilerIdentityDigest: string;
  participantRefs: string[];
  witnessRefs: string[];
  sourceRefs: string[];
  disposition: ActDispositionV0;
  temporalBinding: TemporalBindingV0;
  previousReceiptRefs: string[];
  claims: {
    admittedParticularDigest: true;
    deterministicIdentity: true;
  };
  doesNotClaim: string[];
};
