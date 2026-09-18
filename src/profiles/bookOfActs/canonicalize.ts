import type { ParticularActV0 } from "./types";

export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;

  const object = value as Record<string, unknown>;
  return `{${Object.keys(object)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(object[key])}`)
    .join(",")}}`;
}

function sorted(values: string[]): string[] {
  return [...values].sort();
}

export function canonicalizeParticularAct(act: ParticularActV0): ParticularActV0 {
  return {
    ...structuredClone(act),
    needRefs: sorted(act.needRefs),
    offerRefs: sorted(act.offerRefs),
    joinRefs: sorted(act.joinRefs),
    participants: act.participants
      .map((participant) => ({
        ...participant,
        contributionRefs: sorted(participant.contributionRefs),
      }))
      .sort((a, b) => a.actorRef.localeCompare(b.actorRef)),
    occurrences: act.occurrences.map((occurrence) => ({
      ...occurrence,
      sourceRefs: sorted(occurrence.sourceRefs),
    })),
    constraints: act.constraints
      .map((constraint) => ({
        ...constraint,
        sourceRefs: sorted(constraint.sourceRefs),
      }))
      .sort((a, b) => a.constraintRef.localeCompare(b.constraintRef)),
    artifactRefs: sorted(act.artifactRefs),
    witnessRefs: sorted(act.witnessRefs),
    residualFog: [...act.residualFog],
  };
}

export async function sha256Content(value: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(canonicalJson(value));
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  const hex = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return `sha256:${hex}`;
}
