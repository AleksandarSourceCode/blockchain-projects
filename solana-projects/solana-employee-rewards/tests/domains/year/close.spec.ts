import { expect } from "chai";

import { getTestContext } from "../../context/test-context";
import { ranks } from "../../constants/ranks";
import { setupGlobalIfNeeded } from "../../helpers/setup/setup-global";
import { deriveYearConfigPda } from "../../helpers/pda/derive-pdas";
import { getNewYear } from "../../helpers/setup/unique-year";

describe("Year — close", () => {
  const { program, connection, admin } = getTestContext();

  const YEAR1 = getNewYear();
  const YEAR2 = getNewYear();

  before(async () => {
    await setupGlobalIfNeeded(program, connection, admin);
  });

  it("closes an open year and prevents closing it again", async () => {
    await program.methods.openYear(YEAR1, ranks).accounts({}).rpc();

    await program.methods.closeYear(YEAR1).accounts({}).rpc();

    const [yearPda] = deriveYearConfigPda(program.programId, YEAR1);
    const yearAccount = await program.account.yearConfig.fetch(yearPda);

    expect(yearAccount.isOpen).to.eq(false);
    expect(yearAccount.year).to.eq(YEAR1);

    await expect(program.methods.closeYear(YEAR1).accounts({}).rpc()).to.be
      .rejected;
  });

  it("rejects closing an unopened year", async () => {
    await expect(program.methods.closeYear(YEAR2).accounts({}).rpc()).to.be
      .rejected;
  });
});
