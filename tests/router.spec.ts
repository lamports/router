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

describe('router', () => {

  const provider : anchor.Provider = anchor.Provider.local(); 
  anchor.setProvider(provider);
  const routerAccount: Keypair  = anchor.web3.Keypair.generate();


  it('Is initialized!', async () => {
    // Add your test here.
    const program = anchor.workspace.Router;
    const tx = await program.rpc.initializeRouter({
     accounts : {
      routerAccount : routerAccount.publicKey,
      user : provider.wallet.publicKey,
      systemProgram : SystemProgram.programId
     },
     signers :[routerAccount]
    });
    
    const routerData:RouterData = await program.account.routerData.fetch(routerAccount.publicKey);
    assert.ok(routerData.authority.equals(provider.wallet.publicKey));
    assert.isString("tr_test", tx);
  });
});

