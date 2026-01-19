import { AnchorError } from "@coral-xyz/anchor";
import { expect } from "chai";

export async function expectAnchorError(
  promise: Promise<unknown>,
  errorCode?: string,
) {
  try {
    await promise;
    throw new Error(
      errorCode
        ? `Expected Anchor error: ${errorCode}`
        : "Expected transaction to fail",
    );
  } catch (err) {
    if (errorCode) {
      expect(err).to.be.instanceOf(AnchorError);
      expect((err as AnchorError).error.errorCode.code).to.eq(errorCode);
    } else {
      expect(err).to.exist;
    }
  }
}
