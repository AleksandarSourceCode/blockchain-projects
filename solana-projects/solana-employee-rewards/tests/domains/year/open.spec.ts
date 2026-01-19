import { expect } from "chai";

import { getTestContext } from "../../context/test-context";
import { ranks } from "../../constants/ranks";
import { setupGlobalIfNeeded } from "../../helpers/setup/setup-global";
import { deriveYearConfigPda } from "../../helpers/pda/derive-pdas";
import { getNewYear } from "../../helpers/setup/unique-year";

describe("Year — open", () => {
  const { program, connection, admin } = getTestContext();

  const YEAR1 = getNewYear();
  const YEAR2 = getNewYear();
  const YEAR3 = getNewYear();

  before(async () => {
    await setupGlobalIfNeeded(program, connection, admin);
  });

  it("opens a new year", async () => {
    await program.methods.openYear(YEAR1, ranks).accounts({}).rpc();

    const [yearPda] = deriveYearConfigPda(program.programId, YEAR1);
    const yearAccount = await program.account.yearConfig.fetch(yearPda);

    expect(yearAccount.isOpen).to.eq(true);
    expect(yearAccount.year).to.eq(YEAR1);
  });

  it("allows opening multiple years", async () => {
    await program.methods.openYear(YEAR2, ranks).accounts({}).rpc();
    await program.methods.openYear(YEAR3, ranks).accounts({}).rpc();

    const [yearPda] = deriveYearConfigPda(program.programId, YEAR3);
    const yearAccount = await program.account.yearConfig.fetch(yearPda);

    expect(yearAccount.isOpen).to.eq(true);
    expect(yearAccount.year).to.eq(YEAR3);
  });

  it("rejects opening an already open year", async () => {
    await expect(program.methods.openYear(YEAR1, ranks).accounts({}).rpc()).to
      .be.rejected;
  });
});
