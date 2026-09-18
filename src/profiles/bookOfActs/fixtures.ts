import type { ParticularActV0 } from "./types";

export const GROCERY_DELIVERY_ACT_V0 = Object.freeze({
  schema: "nuthang.particular-act/0.1",
  actId: "act:grocery-delivery-001",
  subject: { kind: "community-need", ref: "need:grocery-delivery-001" },
  needRefs: ["need:grocery-delivery-001"],
  offerRefs: ["offer:food", "offer:vehicle", "offer:time"],
  joinRefs: ["join:a", "join:b", "join:c"],
  participants: [
    { actorRef: "human:a", declaredCapacity: "driver", contributionRefs: ["offer:vehicle"] },
    { actorRef: "human:b", declaredCapacity: "food", contributionRefs: ["offer:food"] },
    { actorRef: "human:c", declaredCapacity: "volunteer", contributionRefs: ["offer:time"] },
  ],
  occurrences: [
    {
      occurrenceRef: "occurrence:pickup",
      kind: "pickup",
      evidenceClass: "observed",
      sourceRefs: ["witness:pickup"],
    },
    {
      occurrenceRef: "occurrence:delivery",
      kind: "delivery",
      evidenceClass: "reported",
      sourceRefs: ["report:recipient"],
    },
  ],
  constraints: [
    {
      constraintRef: "constraint:item-unavailable",
      kind: "item-unavailable",
      sourceRefs: ["report:store"],
    },
  ],
  artifactRefs: ["artifact:shopping-list"],
  witnessRefs: ["witness:driver", "witness:recipient"],
  disposition: "scoped_complete",
  residualFog: ["requested item unavailable; scope allowed explicit exception"],
  disclosure: {
    communityMemory: "named-circle",
    aiTraining: "not-granted",
  },
  temporalBinding: {
    subjectOccurrenceRef: "time:2026-09-18T12:00:00Z",
    declarationOccurrenceRef: "time:2026-09-18T11:30:00Z",
    applicationOccurrenceRef: "time:2026-09-18T13:00:00Z",
    relation: "contemporaneous-attested",
  },
} satisfies ParticularActV0);

export function retrospectiveGroceryAct(): ParticularActV0 {
  const act = structuredClone(GROCERY_DELIVERY_ACT_V0) as ParticularActV0;
  act.temporalBinding = {
    subjectOccurrenceRef: "time:2026-03-18T12:00:00Z",
    declarationOccurrenceRef: "time:2026-09-18T11:30:00Z",
    applicationOccurrenceRef: "time:2026-09-18T13:00:00Z",
    relation: "retrospective",
  };
  return act;
}
