export type ReconstitutionSeedCargoV0 = {
  instructions: string[];
  capabilityRefs: string[];
  schemaRefs: string[];
  testRefs: string[];
  exampleActRefs: string[];
  formationTrace: string[];
};

export type ReconstitutionSeedV0 = {
  schema: "nuthang.reconstitution-seed/0.1";
  profile: "nuthang/reconstitution-crossing/v0";
  seedId: string;
  sourceActId: string;
  sourceActDigest: string;
  sourceReceiptRefs: string[];
  cargo: ReconstitutionSeedCargoV0;
  transportedAuthorityClaims: string[];
  doesNotClaim: string[];
};

export type LocalAdmissionV0 = {
  admissionRef: string;
  capabilityRef: string;
};

export type LocalAuthorityGrantV0 = {
  grantRef: string;
  action: string;
  targetRef: string;
};

export type ReconstitutionEventV0 = {
  schema: "nuthang.reconstitution-event/0.1";
  profile: "nuthang/reconstitution-crossing/v0";
  eventId: string;
  seedId: string;
  sourceReceiptRefs: string[];
  hatchOccurrenceRef: string;
  environmentRef: string;
  targetRef: string;
  localAdmissions: LocalAdmissionV0[];
  effectiveAuthorityGrants: LocalAuthorityGrantV0[];
  transportedAuthorityClaims: string[];
  resultingParticularRef: string;
  identityRelation: "new-particular";
  claims: {
    informationCrossed: true;
    authorityInherited: false;
    identityContinued: false;
  };
  residuals: string[];
};

export type ActionDecisionV0 = {
  capability: "available" | "unavailable";
  authority: "locally-granted" | "absent";
  action: "permitted" | "blocked";
  capabilityRef: string;
  requestedAction: string;
  matchedGrantRef?: string;
};
