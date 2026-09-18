import type { CompilerIdentity } from "../../lib/jubilee";
import { sha256Content } from "./canonicalize";
import {
  BOOK_OF_ACTS_COMPILER_IDENTITY,
  BOOK_OF_ACTS_NON_CLAIMS,
  BOOK_OF_ACTS_PROFILE,
  compileAct,
} from "./compileAct";
import type { ActReceiptV0, ParticularActV0 } from "./types";

export type ActReceiptVerificationV0 = {
  status: "VALID" | "MISMATCH" | "MALFORMED";
  checks: {
    profileMatches: boolean;
    actDigestMatches: boolean;
    receiptIdMatches: boolean;
    compilerIdentityMatches: boolean;
    nonClaimsIntact: boolean;
  };
  conclusion: string;
};

export async function verifyActReceipt(
  receipt: ActReceiptV0,
  act: ParticularActV0,
  options: { compilerIdentity?: CompilerIdentity } = {},
): Promise<ActReceiptVerificationV0> {
  const compilerIdentity =
    options.compilerIdentity ?? BOOK_OF_ACTS_COMPILER_IDENTITY;

  if (receipt.schema !== "nuthang.act-receipt/0.1") {
    return {
      status: "MALFORMED",
      checks: {
        profileMatches: false,
        actDigestMatches: false,
        receiptIdMatches: false,
        compilerIdentityMatches: false,
        nonClaimsIntact: false,
      },
      conclusion: "Receipt schema is not Book of Acts v0.",
    };
  }

  const expected = await compileAct(act, {
    compilerIdentity,
    previousReceiptRefs: receipt.previousReceiptRefs,
  });

  const checks = {
    profileMatches: receipt.profile === BOOK_OF_ACTS_PROFILE,
    actDigestMatches: receipt.actDigest === expected.actDigest,
    receiptIdMatches: receipt.receiptId === expected.receiptId,
    compilerIdentityMatches:
      receipt.compilerIdentityDigest === (await sha256Content(compilerIdentity)),
    nonClaimsIntact:
      JSON.stringify(receipt.doesNotClaim) ===
      JSON.stringify([...BOOK_OF_ACTS_NON_CLAIMS]),
  };

  const valid = Object.values(checks).every(Boolean);

  return {
    status: valid ? "VALID" : "MISMATCH",
    checks,
    conclusion: valid
      ? "The supplied particular deterministically reproduces this Book of Acts receipt under the supplied compiler identity."
      : "The supplied particular or receipt does not reproduce the claimed Book of Acts identity.",
  };
}
