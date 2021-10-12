require("dotenv").config();
import * as anchor from "@project-serum/anchor";
import { LAMPORTS_PER_SOL, SystemProgram, Keypair } from "@solana/web3.js";
import { assert, expect } from "chai";
import { RouterData, Workspace, UserVaultData } from "./models";
import {
  getRouterData,
  getDefaultAnchorWorkspace,
  getCustomWorkspace,
  getSigner1Wallet,
  getSigner2Wallet,
  getUserVaultData,
} from "./helper";

describe("MINTING NFT", async () => {
  const signer1Wallet = getSigner1Wallet();
  const signer2Wallet = getSigner2Wallet();

  let routerWorkspace: Workspace = null;
  let vaultWorkspace: Workspace = null;
  if (JSON.parse(process.env.USE_DEFAULT_WORKSPACE)) {
    routerWorkspace = getDefaultAnchorWorkspace("router");
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

  const routerProgram = routerWorkspace.program;
  const routerProvider: anchor.Provider = routerWorkspace.provider;

  const vaultProgram = vaultWorkspace.program;
  let vaultAccount: Keypair = null;
  let routerAccount: Keypair = null;

  beforeEach(async () => {
    // initialize vault account
    routerAccount = anchor.web3.Keypair.generate();
    vaultAccount = anchor.web3.Keypair.generate();
    try {
      const tx = await vaultProgram.rpc.initializeUserVault({
        accounts: {
          userVaultAccount: vaultAccount.publicKey,
          payer: routerProvider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        //instructions : [await vaultProgram.account.userVaultAccount.createInstruction(userVaultAccount)],
        signers: [vaultAccount],
      });
      console.log("Generated new vault account with transaction id :: ", tx);

      // initialize router account
      await routerProgram.rpc.initializeRouter(
        vaultWorkspace.program.programId,
        {
          accounts: {
            routerAccount: routerAccount.publicKey,
            payer: routerProvider.wallet.publicKey,
            systemProgram: SystemProgram.programId,
            wallet: routerProvider.wallet.publicKey,
          },
          signers: [routerAccount],
        }
      );
    } catch (err) {
      console.log(err);
    }

    try {
      await routerProgram.rpc.updateConfig(
        {
          price: null,
          goLiveDate: new anchor.BN(Date.now() / 1000 + 10000),
          uuid: null,
          itemsAvailable: 1000,
        },
        {
          accounts: {
            routerAccount: routerAccount.publicKey,
            authority: routerProvider.wallet.publicKey,
            wallet: routerProvider.wallet.publicKey,
          },
        }
      );
      const nftSubAccount = anchor.web3.Keypair.generate().publicKey;
      await routerProgram.rpc.addNftSubAccount(
        [
          {
            nftSubAccount: nftSubAccount,
            currentSubAccountIndex: 0,
          },
        ],
        {
          accounts: {
            routerAccount: routerAccount.publicKey,
            authority: routerProvider.wallet.publicKey,
            wallet: routerProvider.wallet.publicKey,
          },
        }
      );
    } catch (err) {
      console.log(err);
    }

    anchor.setProvider(routerProvider);
  });

  it("Should not allow transfer if not go live yet", async () => {
    let err = null;
    try {
      await routerProgram.rpc.addUserForMintingNft(2, {
        accounts: {
          routerAccount: routerAccount.publicKey,
          authority: routerProvider.wallet.publicKey,
          vaultAccount: vaultAccount.publicKey,
          vaultProgram: vaultProgram.programId,
          payer: signer1Wallet.publicKey,
          wallet: routerProvider.wallet.publicKey,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
          systemProgram: SystemProgram.programId,
        },
        signers: [signer1Wallet],
      });
    } catch (error) {
      err = error;
    }
    console.log(err);
    expect("We are not live yet").to.be.equals(err.msg);
  });

  it(" Should  allow minting if not go live yet for authority", async () => {
    const connection = anchor.getProvider().connection;
    const beforeReceiverBalance = await connection.getBalance(
      signer2Wallet.publicKey
    );
    let isError = false;
    let errorMsg = null;
    try {
      await routerProgram.rpc.updateConfig(
        {
          price: null,
          goLiveDate: new anchor.BN(Date.now() / 1000 + 10000000),
          uuid: null,
          itemsAvailable: 1000,
        },
        {
          accounts: {
            routerAccount: routerAccount.publicKey,
            authority: routerProvider.wallet.publicKey,
            wallet: routerProvider.wallet.publicKey,
          },
        }
      );

      //debugger;

      await routerProgram.rpc.addUserForMintingNft(2, {
        accounts: {
          routerAccount: routerAccount.publicKey,
          authority: routerProvider.wallet.publicKey,
          vaultAccount: vaultAccount.publicKey,
          vaultProgram: vaultProgram.programId,
          payer: routerProvider.wallet.publicKey,
          wallet: routerProvider.wallet.publicKey,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
          systemProgram: SystemProgram.programId,
        },
        signers: [signer2Wallet],
      });
      const afterReceiverBalance = await connection.getBalance(
        signer2Wallet.publicKey
      );
      expect(beforeReceiverBalance).to.be.greaterThan(afterReceiverBalance);
    } catch (err) {
      isError = true;
      errorMsg = err.msg;
      console.log(err);
      console.log(
        "Authority : This error occurs because we are not connected to localnet/dev/test/prod"
      );
    }

    assert.isFalse(isError, errorMsg);
  });

  it("Should allow transfer sols to the router account", async () => {
    let isError = false;
    let errorMsg = null;
    try {
      const connection = anchor.getProvider().connection;
      await routerProgram.rpc.updateConfig(
        {
          price: 4 * LAMPORTS_PER_SOL,
          goLiveDate: new anchor.BN(Date.now() / 1000 - 10000000),
          uuid: null,
          itemsAvailable: 1000,
        },
        {
          accounts: {
            routerAccount: routerAccount.publicKey,
            authority: routerProvider.wallet.publicKey,
            wallet: routerProvider.wallet.publicKey,
          },
        }
      );

      const beforeReceiverBalance = await connection.getBalance(
        signer2Wallet.publicKey
      );
      const beforePayerBalance = await connection.getBalance(
        signer1Wallet.publicKey
      );
      const beforeRouterData: RouterData = await getRouterData(
        routerProgram,
        routerAccount
      );

      // check if the MintTokenEvent is fired
      let listener = null;
      let [event, slot] = await new Promise((resolve, _) => {
        listener = routerProgram.addEventListener(
          "MintTokenEvent",
          (event, slot) => {
            resolve([event, slot]);
          }
        );

        routerProgram.rpc.addUserForMintingNft(2, {
          accounts: {
            routerAccount: routerAccount.publicKey,
            authority: routerProvider.wallet.publicKey,
            vaultAccount: vaultAccount.publicKey,
            vaultProgram: vaultProgram.programId,
            payer: signer1Wallet.publicKey,
            wallet: routerProvider.wallet.publicKey,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
            systemProgram: SystemProgram.programId,
          },
          signers: [signer1Wallet],
        });
      });

      await routerProgram.removeEventListener(listener);

      const routerData: RouterData = await getRouterData(
        routerProgram,
        routerAccount
      );
      // console.log(routerData);
      const afterReceiverBalance = await connection.getBalance(
        signer2Wallet.publicKey
      );
      const afterPayerBalance = await connection.getBalance(
        signer1Wallet.publicKey
      );
      // check if balances have been transferred
      expect(afterReceiverBalance).to.be.greaterThan(beforeReceiverBalance);
      expect(afterPayerBalance).to.be.lessThan(beforePayerBalance);
      // check if the items have been reduced
      expect(routerData.config.itemsAvailable).to.be.lessThan(1000);
      assert.ok(routerData.config.itemsAvailable === 998);
      assert.ok(
        routerData.data.subAccounts[0].currentSubAccountIndex ===
          beforeRouterData.data.subAccounts[0].currentSubAccountIndex + 2
      );

      const vaultData: UserVaultData = await getUserVaultData(
        vaultProgram,
        vaultAccount
      );

      console.log(
        "Users PubKeys added length --> ",
        vaultData.usersPubKey.length
      );
      // check if the vault has been updated
      assert.ok(vaultData.usersPubKey.length == 2);
      assert.ok(vaultData.usersPubKey[0].equals(signer1Wallet.publicKey));
      assert.ok(vaultData.usersPubKey[1].equals(signer1Wallet.publicKey));

      // MInt token Event test
      assert.ok(slot > 0);
      assert.ok(event.currentAccountIndex === 0);
      assert.ok(event.payerKey.equals(signer1Wallet.publicKey));
    } catch (err) {
      console.log(err);
      console.log(
        " This error occurs because we are not connected to localnet/dev/test/prod"
      );
      isError = true;
      errorMsg = err;
    }

    assert.isFalse(isError, errorMsg);
    assert.isNull(errorMsg);
  });

  it("Should not allow minting if less items available", async () => {
    let isError = false;
    let errorMsg = null;
    try {
      const connection = anchor.getProvider().connection;
      await routerProgram.rpc.updateConfig(
        {
          price: 4 * LAMPORTS_PER_SOL,
          goLiveDate: new anchor.BN(Date.now() / 1000 - 10000000),
          uuid: null,
          itemsAvailable: 1,
        },
        {
          accounts: {
            routerAccount: routerAccount.publicKey,
            authority: routerProvider.wallet.publicKey,
            wallet: routerProvider.wallet.publicKey,
          },
        }
      );

      const beforeReceiverBalance = await connection.getBalance(
        signer2Wallet.publicKey
      );
      const beforePayerBalance = await connection.getBalance(
        signer1Wallet.publicKey
      );
      const beforeRouterData: RouterData = await getRouterData(
        routerProgram,
        routerAccount
      );

      // check if the MintTokenEvent is fired

      await routerProgram.rpc.addUserForMintingNft(2, {
        accounts: {
          routerAccount: routerAccount.publicKey,
          authority: routerProvider.wallet.publicKey,
          vaultAccount: vaultAccount.publicKey,
          vaultProgram: vaultProgram.programId,
          payer: signer1Wallet.publicKey,
          wallet: routerProvider.wallet.publicKey,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
          systemProgram: SystemProgram.programId,
        },
        signers: [signer1Wallet],
      });

      const routerData: RouterData = await getRouterData(
        routerProgram,
        routerAccount
      );
      // console.log(routerData);
      const afterReceiverBalance = await connection.getBalance(
        signer2Wallet.publicKey
      );
      const afterPayerBalance = await connection.getBalance(
        signer1Wallet.publicKey
      );
      // check if balances have been transferred
      console.log(routerData);
    } catch (err) {
      console.log(err);
      console.log(
        " This error occurs because we are not connected to localnet/dev/test/prod"
      );
      isError = true;
      errorMsg = err;
    }

    assert.isTrue(isError, errorMsg);
    assert.isNotNull(errorMsg);
  });
});
