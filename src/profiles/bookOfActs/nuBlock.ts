import { sha256Content } from "./canonicalize";
import { BOOK_OF_ACTS_PROFILE } from "./compileAct";
import type { ActDispositionV0, ActReceiptV0, NuBlockV0 } from "./types";

export async function closeNuBlock(input: {
  subjectRef: string;
  receipts: ActReceiptV0[];
  artifactRefs: string[];
  disposition: ActDispositionV0;
  residualFog: string[];
}): Promise<NuBlockV0> {
  if (!input.subjectRef.trim()) throw new Error("subjectRef must be non-empty");
  if (input.receipts.length === 0) {
    throw new Error("nuBlock requires at least one ActReceipt");
  }

  const body = {
    schema: "nuthang.nu-block/0.1" as const,
    profile: BOOK_OF_ACTS_PROFILE,
    subjectRef: input.subjectRef,
    actReceiptRefs: input.receipts.map((receipt) => receipt.receiptId).sort(),
    artifactRefs: [...input.artifactRefs].sort(),
    disposition: input.disposition,
    residualFog: [...input.residualFog],
  };

  return { ...body, blockId: await sha256Content(body) };
}
