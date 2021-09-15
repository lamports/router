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
import {RouterData} from "./models";
import {getRouterData} from "./helper";

describe('router', () => {

  const provider : anchor.Provider = anchor.Provider.local(); 
  anchor.setProvider(provider);
  const routerAccount: Keypair  = anchor.web3.Keypair.generate();
  const program = anchor.workspace.Router;

  it('Is initialized!', async () => {
    // Add your test here.
    
    const tx = await program.rpc.initializeRouter({
     accounts : {
      routerAccount : routerAccount.publicKey,
      user : provider.wallet.publicKey,
      systemProgram : SystemProgram.programId
     },
     signers :[routerAccount]
    });
    
    const routerData:RouterData = await getRouterData(program,routerAccount);
    assert.ok(routerData.authority.equals(provider.wallet.publicKey));
    assert.isString("tr_test", tx);
  });

  it("should update configuration", async () => {
    const priceInLamports = 1 * LAMPORTS_PER_SOL;
    const goLiveDate = Math.round(new Date().getTime() / 1000) + 2000;
    const tx = await program.rpc.updateConfig(
    {
      data : {
        currentIndex : 1,
        subAccounts : [
          {
            nftSubAccount : anchor.web3.Keypair.generate().publicKey,
            currentCount : 1,
        }
      ]
      },
      authority : provider.wallet.publicKey,
      config : {
        price : priceInLamports,
        goLiveDate : goLiveDate

      }
    },
    {
      accounts : {
        routerAccount : routerAccount.publicKey,
        authority : provider.wallet.publicKey,
      }
    });
    const routerData:RouterData = await getRouterData(program,routerAccount);
    assert.ok(routerData.config.price === priceInLamports);
    assert.ok(routerData.config.goLiveDate === goLiveDate); 
    assert.isString("tr_test", tx);

  });

});



