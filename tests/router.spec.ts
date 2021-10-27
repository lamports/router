require("dotenv").config();
import * as anchor from "@project-serum/anchor";
import { LAMPORTS_PER_SOL, SystemProgram, Keypair } from "@solana/web3.js";
import { assert, expect } from "chai";
import { NftSubAccount, RouterData, Workspace } from "./models";
import {
  getRouterData,
  getDefaultAnchorWorkspace,
  getCustomWorkspace,
  getSigner1Wallet,
  getSigner2Wallet,
} from "./helper";

describe("router", () => {
  const signer1Wallet = getSigner1Wallet();
  const signer2Wallet = getSigner2Wallet();

  let program: anchor.Program = null;
  let provider: anchor.Provider = null;
  let routerWorkspace: Workspace = null;

  let vaultWorkspace: Workspace = null;

  if (JSON.parse(process.env.USE_DEFAULT_WORKSPACE)) {
    routerWorkspace = getDefaultAnchorWorkspace("router");
    vaultWorkspace = getDefaultAnchorWorkspace("vault");
  } else {
    // make sure signer 2 has some sols
    // make sure signer 1 has some sols
    routerWorkspace = getCustomWorkspace(
      signer2Wallet,
      process.env.ROUTER_IDL_PATH,
      process.env.ROUTER_PROGRAM_ID
    );

    vaultWorkspace = getCustomWorkspace(
      signer2Wallet,
      process.env.VAULT_IDL_PATH,
      process.env.VAULT_PROGRAM_ID
    );
  }

  program = routerWorkspace.program;
  provider = routerWorkspace.provider;

  const routerAccount: Keypair = anchor.web3.Keypair.generate();
  const priceInLamports = 4 * LAMPORTS_PER_SOL;
  const date = Math.round(new Date().getTime() / 1000) + 2000;
  const secondsSinceEpoch = Date.now() / 1000;

  anchor.setProvider(provider);

  it("Is initialized!", async () => {
    // Add your test here.

    const tx = await program.rpc.initializeRouter(
      vaultWorkspace.program.programId,
      {
        accounts: {
          routerAccount: routerAccount.publicKey,
          payer: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
          wallet: provider.wallet.publicKey,
        },
        signers: [routerAccount],
      }
    );

    const routerData: RouterData = await getRouterData(program, routerAccount);
    assert.ok(routerData.authority.equals(provider.wallet.publicKey));
    assert.ok(routerData.wallet.equals(provider.wallet.publicKey));
    assert.isString("tr_test", tx);
  });

  it("should update configuration", async () => {
    const tx = await program.rpc.updateConfig(
      {
        price: priceInLamports,
        goLiveDate: new anchor.BN(secondsSinceEpoch + 10000),
        uuid: "123456",
        itemsAvailable: new anchor.BN(10000),
      },
      {
        accounts: {
          routerAccount: routerAccount.publicKey,
          authority: provider.wallet.publicKey,
          wallet: provider.wallet.publicKey,
        },
      }
    );
    const routerData: RouterData = await getRouterData(program, routerAccount);
    assert.ok(
      routerData.config.price.toString() === priceInLamports.toString()
    );
    assert.ok(
      routerData.config.goLiveDate.toString() ===
        new anchor.BN(secondsSinceEpoch + 10000).toString()
    );
    assert.ok(routerData.config.itemsAvailable.toString() === "10000");
    assert.isString("tr_test", tx);
  });

  it("should add nft account into the vault router", async () => {
    const nftSubAccount = anchor.web3.Keypair.generate().publicKey;
    const tx = await program.rpc.addNftSubAccount(
      [
        {
          nftSubAccount: nftSubAccount,
          currentSubAccountIndex: 0,
        },
      ],
      {
        accounts: {
          routerAccount: routerAccount.publicKey,
          authority: provider.wallet.publicKey,
          wallet: provider.wallet.publicKey,
        },
      }
    );

    const routerData: RouterData = await getRouterData(program, routerAccount);
    assert.ok(routerData.data.subAccounts.length === 1);
    assert.ok(
      routerData.data.subAccounts[0].nftSubAccount.equals(nftSubAccount)
    );

    //console.log(routerData);
  });

  it("should not allow updating account data with different signer", async () => {
    let err: Error = null;
    try {
      await program.rpc.updateConfig(
        {
          price: null,
          goLiveDate: new anchor.BN(secondsSinceEpoch - 10000),
          uuid: null,
          itemsAvailable: null,
        },
        {
          accounts: {
            routerAccount: routerAccount.publicKey,
            authority: signer1Wallet.publicKey,
          },
        }
      );
    } catch (error) {
      err = error;
    }
    expect("Signature verification failed").to.be.equals(err.message);
  });

  it("should be able to add 15 accounts into the router vault", async () => {
    let nftSubAccounts: Array<NftSubAccount> = [];

    for (let i = 0; i < 15; i++) {
      let nftSubAccount: NftSubAccount = {
        nftSubAccount: anchor.web3.Keypair.generate().publicKey,
        currentSubAccountIndex: 240, // because each account can store 240 pubkeys
      };

      nftSubAccounts.push(nftSubAccount);
    }

    await program.rpc.addNftSubAccount(nftSubAccounts, {
      accounts: {
        routerAccount: routerAccount.publicKey,
        authority: provider.wallet.publicKey,
      },
    });

    const routerData: RouterData = await getRouterData(program, routerAccount);
    assert.ok(routerData.data.subAccounts.length === 16);
  });

  it("should be able to add another 15 accounts into the router vault", async () => {
    let nftSubAccounts: Array<NftSubAccount> = [];

    for (let i = 0; i < 15; i++) {
      let nftSubAccount: NftSubAccount = {
        nftSubAccount: anchor.web3.Keypair.generate().publicKey,
        currentSubAccountIndex: 100,
      };

      nftSubAccounts.push(nftSubAccount);
    }

    const tx = await program.rpc.addNftSubAccount(nftSubAccounts, {
      accounts: {
        routerAccount: routerAccount.publicKey,
        authority: provider.wallet.publicKey,
      },
    });

    const routerData: RouterData = await getRouterData(program, routerAccount);
    assert.ok(routerData.data.subAccounts.length === 31);
  });

  it("should be able to add another 10 accounts into the router vault", async () => {
    let nftSubAccounts: Array<NftSubAccount> = [];

    for (let i = 0; i < 15; i++) {
      let nftSubAccount: NftSubAccount = {
        nftSubAccount: anchor.web3.Keypair.generate().publicKey,
        currentSubAccountIndex: 100,
      };

      nftSubAccounts.push(nftSubAccount);
    }

    const tx = await program.rpc.addNftSubAccount(nftSubAccounts, {
      accounts: {
        routerAccount: routerAccount.publicKey,
        authority: provider.wallet.publicKey,
      },
    });

    const routerData: RouterData = await getRouterData(program, routerAccount);
    console.log(routerData.data.subAccounts.length);
    assert.ok(routerData.data.subAccounts.length === 46);
  });

  describe("Sub Account ", async () => {
    it("should increment by one", async () => {
      try {
        const beforeRouterData: RouterData = await getRouterData(
          program,
          routerAccount
        );
        const beforeSubAccountIndex =
          beforeRouterData.data.subAccounts[
            beforeRouterData.data.currentAccountIndex
          ].currentSubAccountIndex;

        await program.rpc.incrementSubAccountIndexByOne({
          accounts: {
            routerAccount: routerAccount.publicKey,
            authority: provider.wallet.publicKey,
          },
        });

        const routerData: RouterData = await getRouterData(
          program,
          routerAccount
        );
        const afterSubAccountIndex =
          routerData.data.subAccounts[beforeRouterData.data.currentAccountIndex]
            .currentSubAccountIndex;
        assert.ok(afterSubAccountIndex === beforeSubAccountIndex + 1);
      } catch (err) {
        console.log("INCREMENT PROBLEM");
        console.log(err);
      }
    });
  });

  describe("Close Sub Account", async () => {
    const workspace: Workspace = getCustomWorkspace(
      signer2Wallet,
      process.env.VAULT_IDL_PATH,
      process.env.VAULT_PROGRAM_ID
    );
    const vaultProgram = workspace.program;
    let vaultAccount: Keypair = null;

    beforeEach(async () => {
      try {
        vaultAccount = anchor.web3.Keypair.generate();
        const tx = await vaultProgram.rpc.initializeUserVault({
          accounts: {
            userVaultAccount: vaultAccount.publicKey,
            payer: provider.wallet.publicKey,
            systemProgram: SystemProgram.programId,
          },
          //instructions : [await vaultProgram.account.userVaultAccount.createInstruction(userVaultAccount)],
          signers: [vaultAccount],
        });
        //console.log("Your transaction signature", tx);
        console.log("Generated new vault account with transaction id :: ", tx);

        await program.rpc.addNftSubAccount(
          [
            {
              nftSubAccount: vaultAccount.publicKey,
              nftSubProgramId: vaultProgram.programId,
              currentSubAccountIndex: 0,
            },
          ],
          {
            accounts: {
              routerAccount: routerAccount.publicKey,
              authority: provider.wallet.publicKey,
              wallet: provider.wallet.publicKey,
            },
          }
        );
      } catch (err) {
        console.log(err);
      }
    });

    it("should close the VAULT account", async () => {
      let isError = false;
      try {
        const connection = anchor.getProvider().connection;
        const beforeReceiverBalance = await connection.getBalance(
          signer2Wallet.publicKey
        );
        await program.rpc.closeSubAccount({
          accounts: {
            routerAccount: routerAccount.publicKey,
            vaultAccount: vaultAccount.publicKey,
            vaultProgram: vaultProgram.programId,
            authority: provider.wallet.publicKey,
          },
          signers: [signer2Wallet],
        });
        const afterReceiverBalance = await connection.getBalance(
          signer2Wallet.publicKey
        );

        expect(afterReceiverBalance).to.be.greaterThan(beforeReceiverBalance);
      } catch (err) {
        isError = true;
        console.log(err);
      }

      assert.isFalse(isError, "Could not close the sub account");
    });
  });
});
