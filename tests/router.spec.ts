import * as anchor from '@project-serum/anchor';
import {  
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Keypair,
  TransactionInstruction} from "@solana/web3.js";
import {assert, expect} from "chai";
import BN from 'bn.js';
import {NftSubAccount, RouterData} from "./models";
import {getRouterData} from "./helper";

describe('router', () => {

  const provider : anchor.Provider = anchor.Provider.local(); 
  anchor.setProvider(provider);
  const routerAccount: Keypair  = anchor.web3.Keypair.generate();

  const priceInLamports = 1 * LAMPORTS_PER_SOL;
  const date = Math.round(new Date().getTime() / 1000) + 2000;
  const secondsSinceEpoch =  Date.now() / 1000;

  
  const program = anchor.workspace.Router;

  it('Is initialized!', async () => {
    // Add your test here.
    
    const tx = await program.rpc.initializeRouter({
     accounts : {
      routerAccount : routerAccount.publicKey,
      payer : provider.wallet.publicKey,
      systemProgram : SystemProgram.programId,
      wallet : provider.wallet.publicKey
     },
     signers :[routerAccount]
    });
    
    const routerData:RouterData = await getRouterData(program,routerAccount);
    assert.ok(routerData.authority.equals(provider.wallet.publicKey));
    assert.ok(routerData.wallet.equals(provider.wallet.publicKey))
    assert.isString("tr_test", tx);
  });

  it("should update configuration", async () => {
    const tx = await program.rpc.updateConfig( 
    {
        price : priceInLamports,
        goLiveDate : new anchor.BN(secondsSinceEpoch),
        uuid : "123456",
        itemsAvailable : new anchor.BN(10000)
    },
    {
      accounts : {
        routerAccount : routerAccount.publicKey,
        authority : provider.wallet.publicKey,
        wallet : provider.wallet.publicKey
      }
    });
    const routerData:RouterData = await getRouterData(program,routerAccount);
    assert.ok(routerData.config.price.toString() === priceInLamports.toString());
    assert.ok(routerData.config.goLiveDate.toString() === new anchor.BN(secondsSinceEpoch).toString()); 
    assert.ok(routerData.config.itemsAvailable.toString() === "10000");
    assert.isString("tr_test", tx);
  });


    it("should add nft account into the vault router" , async () => {
      const nftSubAccount = anchor.web3.Keypair.generate().publicKey;
      const nftSubProgramId = anchor.web3.Keypair.generate().publicKey;
      const tx = await program.rpc.addNftSubAccount(
      [{
        nftSubAccount : nftSubAccount,
        nftSubProgramId : nftSubProgramId,
        currentCount : 0,
      }],
      {
        accounts : {
          routerAccount : routerAccount.publicKey,
          authority : provider.wallet.publicKey,
          wallet : provider.wallet.publicKey
        }
      });

      const routerData:RouterData = await getRouterData(program,routerAccount);
      assert.ok(routerData.data.subAccounts.length === 1);
      assert.ok(routerData.data.subAccounts[0].nftSubAccount.equals(nftSubAccount));
      assert.ok(routerData.data.subAccounts[0].nftSubProgramId.equals(nftSubProgramId));

      //console.log(routerData);


    });


  // it("should not allow updating account data with different signer", async() => {
  //   expect(await program.rpc.updateConfig(
  //     {
  //       data : {
  //         currentIndex : 1,
  //         subAccounts : [
  //           {
  //             nftSubAccount : anchor.web3.Keypair.generate().publicKey,
  //             currentCount : 1,
  //         }
  //       ]
  //       },
  //       authority : provider.wallet.publicKey,
  //       config : {
  //         price : priceInLamports,
  //         goLiveDate : goLiveDate
  
  //       }
  //     },
  //     {
  //       accounts : {
  //         routerAccount : routerAccount.publicKey,
  //         authority : routerAccount.publicKey,
  //       }
  //     })).to.be.a("Error: Signature verification failed");

    
  // });


    it("should be able to add 15 accounts into the router vault", async() => {
        
        let nftSubAccounts: Array<NftSubAccount> = [];

        for(let i =0 ; i < 15; i++){
          let nftSubAccount : NftSubAccount = {
            nftSubAccount : anchor.web3.Keypair.generate().publicKey,
            nftSubProgramId :  anchor.web3.Keypair.generate().publicKey,
            currentSubAccountIndex : 300 // because each account can store 300 pubkeys
          }

          nftSubAccounts.push(nftSubAccount);
        }

        const tx = await program.rpc.addNftSubAccount(
          nftSubAccounts,
          {
            accounts : {
              routerAccount : routerAccount.publicKey,
              authority : provider.wallet.publicKey,
            }
          });
    
          const routerData:RouterData = await getRouterData(program,routerAccount);
          assert.ok(routerData.data.subAccounts.length === 16);

    });


    it("should be able to add another 15 accounts into the router vault", async() => {
        
      let nftSubAccounts: Array<NftSubAccount> = [];

      for(let i =0 ; i < 15; i++){
        let nftSubAccount : NftSubAccount = {
          nftSubAccount : anchor.web3.Keypair.generate().publicKey,
          nftSubProgramId :  anchor.web3.Keypair.generate().publicKey,
          currentSubAccountIndex : 300 
        }

        nftSubAccounts.push(nftSubAccount);
      }

      const tx = await program.rpc.addNftSubAccount(
        nftSubAccounts,
        {
          accounts : {
            routerAccount : routerAccount.publicKey,
            authority : provider.wallet.publicKey,
          }
        });
  
        const routerData:RouterData = await getRouterData(program,routerAccount);
        assert.ok(routerData.data.subAccounts.length === 31);

  });
});



