import type { CompilerIdentity } from "../../lib/jubilee";
import { canonicalizeParticularAct, sha256Content } from "./canonicalize";
import type { ActReceiptV0, ParticularActV0 } from "./types";

export const BOOK_OF_ACTS_PROFILE = "nuthang/book-of-acts/v0" as const;

export const BOOK_OF_ACTS_COMPILER_IDENTITY: CompilerIdentity = Object.freeze({
  compiler_name: "JubileeBookOfActsCompiler",
  compiler_version: "0.1.0",
  compiler_hash: "profile:book-of-acts/compiler/0.1.0",
  policy_engine_hash: "profile:book-of-acts/admission/0.1.0",
  schema_hash: "nuthang.particular-act/0.1",
  adapter_map_version: "none",
  adapter_map_hash: "none",
});

export const BOOK_OF_ACTS_NON_CLAIMS = Object.freeze([
  "receipt != human worth",
  "receipt != legal validity",
  "receipt != economic value",
  "receipt != token entitlement",
  "receipt != authority",
  "receipt != consensus on meaning",
  "receipt != AI training consent",
] as const);

export function validateParticularAct(act: ParticularActV0): string[] {
  const errors: string[] = [];

  if (act.schema !== "nuthang.particular-act/0.1") errors.push("invalid schema");
  if (!act.actId.trim()) errors.push("actId must be non-empty");
  if (!act.subject.kind.trim()) errors.push("subject.kind must be non-empty");
  if (!act.subject.ref.trim()) errors.push("subject.ref must be non-empty");
  if (!act.temporalBinding.subjectOccurrenceRef.trim()) errors.push("subjectOccurrenceRef must be non-empty");
  if (!act.temporalBinding.applicationOccurrenceRef.trim()) errors.push("applicationOccurrenceRef must be non-empty");
  if (
    act.temporalBinding.relation === "contemporaneous-attested" &&
    !act.temporalBinding.declarationOccurrenceRef?.trim()
  ) {
    errors.push("contemporaneous-attested requires declarationOccurrenceRef");
  }
  if (act.disclosure.aiTraining !== "not-granted") {
    errors.push("aiTraining must remain not-granted in Book of Acts v0");
  }

  return errors;
}

export async function compileAct(
  act: ParticularActV0,
  options: {
    compilerIdentity?: CompilerIdentity;
    previousReceiptRefs?: string[];
  } = {},
): Promise<ActReceiptV0> {
  const errors = validateParticularAct(act);
  if (errors.length) throw new Error(errors.join("; "));

  const normalized = canonicalizeParticularAct(act);
  const compilerIdentity =
    options.compilerIdentity ?? BOOK_OF_ACTS_COMPILER_IDENTITY;

  const actDigest = await sha256Content(normalized);
  const compilerIdentityDigest = await sha256Content(compilerIdentity);

  const sourceRefs = Array.from(
    new Set([
      ...normalized.occurrences.flatMap((value) => value.sourceRefs),
      ...normalized.constraints.flatMap((value) => value.sourceRefs),
    ]),
  ).sort();

  const body = {
    schema: "nuthang.act-receipt/0.1" as const,
    actDigest,
    profile: BOOK_OF_ACTS_PROFILE,
    compilerIdentity,
    compilerIdentityDigest,
    participantRefs: normalized.participants.map((value) => value.actorRef),
    witnessRefs: [...normalized.witnessRefs],
    sourceRefs,
    disposition: normalized.disposition,
    temporalBinding: structuredClone(normalized.temporalBinding),
    previousReceiptRefs: [...(options.previousReceiptRefs ?? [])].sort(),
    claims: {
      admittedParticularDigest: true as const,
      deterministicIdentity: true as const,
    },
    doesNotClaim: [...BOOK_OF_ACTS_NON_CLAIMS],
  };

  return {
    ...body,
    receiptId: await sha256Content(body),
  };
}
