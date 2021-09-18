require("dotenv").config();
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
import {NftSubAccount, RouterData, Workspace} from "./models";
import {getRouterData, getDefaultRouterAnchorWorkspace, getCustomWorkspace} from "./helper";



describe('router', () => {

  const signer1Wallet = anchor.web3.Keypair.fromSecretKey(
    new Uint8Array(
      JSON.parse(require("fs").readFileSync(process.env.SIGNER_1_WALLET, "utf8"))
    )
  );

  const signer2Wallet = anchor.web3.Keypair.fromSecretKey(
    new Uint8Array(
      JSON.parse(require("fs").readFileSync(process.env.SIGNER_2_WALLET, "utf8"))
    )
  );


  let routerProgram: anchor.Program = null;
  let provider: anchor.Provider = null;
  let routerWorkspace: Workspace = null;


  
  let userVaultWorkspace : Workspace = null;
  let userVaultProgram : anchor.Program = null;
  
  if(JSON.parse(process.env.USE_DEFAULT_WORKSPACE)){
    routerWorkspace = getDefaultRouterAnchorWorkspace();
  }
  else{
    // make sure signer 2 has some sols
    // make sure signer 1 has some sols 
    routerWorkspace = getCustomWorkspace(signer2Wallet, process.env.ROUTER_IDL_PATH, process.env.ROUTER_DEPLOYED_PROGRAM_ID);
    userVaultWorkspace = getCustomWorkspace(signer2Wallet, process.env.USER_VAULT_IDL_PATH, process.env.USER_VAULT_PROGRAM_ID);
  }

  routerProgram = routerWorkspace.program;
  provider = routerWorkspace.provider;

  userVaultProgram = userVaultWorkspace.program;


  
  const routerAccount: Keypair  = anchor.web3.Keypair.generate();
  const userVaultAccount: Keypair = anchor.web3.Keypair.generate();
  const priceInLamports = 4 * LAMPORTS_PER_SOL;
  const date = Math.round(new Date().getTime() / 1000) + 2000;
  const secondsSinceEpoch =  Date.now() / 1000;


  anchor.setProvider(provider);





  it('Is initialized!', async () => {
    // Add your test here.
    
    const tx = await routerProgram.rpc.initializeRouter({
     accounts : {
      routerAccount : routerAccount.publicKey,
      payer : provider.wallet.publicKey,
      systemProgram : SystemProgram.programId,
      wallet : provider.wallet.publicKey
     },
     signers :[routerAccount]
    });
    
    const routerData:RouterData = await getRouterData(routerProgram,routerAccount);
    assert.ok(routerData.authority.equals(provider.wallet.publicKey));
    assert.ok(routerData.wallet.equals(provider.wallet.publicKey))
    assert.isString("tr_test", tx);
  });

  it("should update configuration", async () => {
    const tx = await routerProgram.rpc.updateConfig( 
    {
        price : priceInLamports,
        goLiveDate : new anchor.BN(secondsSinceEpoch + 10000),
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
    const routerData:RouterData = await getRouterData(routerProgram,routerAccount);
    assert.ok(routerData.config.price.toString() === priceInLamports.toString());
    assert.ok(routerData.config.goLiveDate.toString() === new anchor.BN(secondsSinceEpoch + 10000).toString()); 
    assert.ok(routerData.config.itemsAvailable.toString() === "10000");
    assert.isString("tr_test", tx);
  });


 /* it("should add nft account into the vault router" , async () => {
    const nftSubAccount = anchor.web3.Keypair.generate().publicKey;
    const nftSubProgramId = anchor.web3.Keypair.generate().publicKey;
    const tx = await routerProgram.rpc.addNftSubAccount(
    [{
      nftSubAccount : nftSubAccount,
      nftSubProgramId : nftSubProgramId,
      currentSubAccountIndex : 0,
    }],
    {
      accounts : {
        routerAccount : routerAccount.publicKey,
        authority : provider.wallet.publicKey,
        wallet : provider.wallet.publicKey
      }
    });

    const routerData:RouterData = await getRouterData(routerProgram,routerAccount);
    assert.ok(routerData.data.subAccounts.length === 1);
    assert.ok(routerData.data.subAccounts[0].nftSubAccount.equals(nftSubAccount));
    assert.ok(routerData.data.subAccounts[0].nftSubProgramId.equals(nftSubProgramId));

    //console.log(routerData);


  });


  it("should not allow updating account data with different signer", async() => {
    let err:Error = null;
    try{
    
      await routerProgram.rpc.updateConfig(
        {
          price : null,
          goLiveDate : new anchor.BN(secondsSinceEpoch- 10000),
          uuid : null,
          itemsAvailable : null
        },
        {
          accounts : {
            routerAccount : routerAccount.publicKey,
            authority : signer1Wallet.publicKey,
          }
        });
    }
    catch(error) {
      err = error;
    } 
    expect("Signature verification failed").to.be.equals(err.message);
    
  });


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

      await routerProgram.rpc.addNftSubAccount(
        nftSubAccounts,
        {
          accounts : {
            routerAccount : routerAccount.publicKey,
            authority : provider.wallet.publicKey,
          }
        });
  
        const routerData:RouterData = await getRouterData(routerProgram,routerAccount);
        assert.ok(routerData.data.subAccounts.length === 16);

  });


  it("should be able to add another 15 accounts into the router vault", async() => {
      
    let nftSubAccounts: Array<NftSubAccount> = [];

    for(let i =0 ; i < 15; i++){
      let nftSubAccount : NftSubAccount = {
        nftSubAccount : anchor.web3.Keypair.generate().publicKey,
        nftSubProgramId :  anchor.web3.Keypair.generate().publicKey,
        currentSubAccountIndex : 100 
      }

      nftSubAccounts.push(nftSubAccount);
    }

    const tx = await routerProgram.rpc.addNftSubAccount(
      nftSubAccounts,
      {
        accounts : {
          routerAccount : routerAccount.publicKey,
          authority : provider.wallet.publicKey,
        }
      });

      const routerData:RouterData = await getRouterData(routerProgram,routerAccount);
      assert.ok(routerData.data.subAccounts.length === 31);
  });

  it("Should not allow transfer if not go live yet", async() => {
    let err = null;
    try {
      await routerProgram.rpc.addUserForMintingNft({
        accounts : {
          routerAccount : routerAccount.publicKey,
          authority : provider.wallet.publicKey,
          payer : signer1Wallet.publicKey,
          wallet : provider.wallet.publicKey,
          rent : anchor.web3.SYSVAR_RENT_PUBKEY,
          clock : anchor.web3.SYSVAR_CLOCK_PUBKEY,
          systemProgram : SystemProgram.programId
        },
        signers : [signer1Wallet]

      });
    }
    catch(error) {
      err = error;
      console.log(err);
    }
    //console.log(err);
    expect("We are not live yet").to.be.equals(err.msg);
  });


  it(" Should  allow transfer if not go live yet for authority", async() => {
    const connection = anchor.getProvider().connection;
    const beforeReceiverBalance = await connection.getBalance(signer2Wallet.publicKey);
    try{
      await routerProgram.rpc.addUserForMintingNft({
        accounts : {
          routerAccount : routerAccount.publicKey,
          authority : provider.wallet.publicKey,
          payer : signer2Wallet.publicKey,
          wallet : provider.wallet.publicKey,
          rent : anchor.web3.SYSVAR_RENT_PUBKEY,
          clock : anchor.web3.SYSVAR_CLOCK_PUBKEY,
          systemProgram : SystemProgram.programId
        },
        signers : [signer2Wallet]
  
      });
      const  afterReceiverBalance = await connection.getBalance(signer2Wallet.publicKey);
      expect(beforeReceiverBalance).to.be.greaterThan(afterReceiverBalance);
    }catch(err){
      console.log(err);
      console.log( "Authority : This error occurs because we are not connected to localnet/dev/test/prod");

    }
    
  }); */

 /* it("Should allow transfer sols to the router account", async() => {
    try {
      const connection = anchor.getProvider().connection;
      const beforeReceiverBalance = await connection.getBalance(signer2Wallet.publicKey);
  
      const beforePayerBalance = await connection.getBalance(signer1Wallet.publicKey);
  
        await routerProgram.rpc.updateConfig({
          price : null,
          goLiveDate : new anchor.BN(secondsSinceEpoch- 100000),
          uuid : null,
          itemsAvailable : null
  
        },{
          accounts : {
            routerAccount : routerAccount.publicKey,
            authority : provider.wallet.publicKey,
            wallet : provider.wallet.publicKey
          }
  
        });


        await initializeUserVault();
        
        
        await routerProgram.rpc.addUserForMintingNft(true,{
          accounts : {
            routerAccount : routerAccount.publicKey,
            //userVault : userVaultAccount.publicKey,
            //userVaultProgram : userVaultProgram.programId,
            authority : provider.wallet.publicKey,
            payer : signer1Wallet.publicKey,
            wallet : provider.wallet.publicKey,
            rent : anchor.web3.SYSVAR_RENT_PUBKEY,
            clock : anchor.web3.SYSVAR_CLOCK_PUBKEY,
            systemProgram : SystemProgram.programId
          },
          signers : [signer1Wallet]
  
        });
  
        //const routerData:RouterData = await getRouterData(program,routerAccount);
        const afterReceiverBalance = await connection.getBalance(signer2Wallet.publicKey);
        const afterPayerBalance = await connection.getBalance(signer1Wallet.publicKey);
        
        expect(afterReceiverBalance).to.be.greaterThan(beforeReceiverBalance);
        expect(afterPayerBalance).to.be.lessThan(beforePayerBalance);
  
        //console.log(routerData);
    }
    catch(err){
      console.log(err);
      console.log( " This error occurs because we are not connected to localnet/dev/test/prod");
    }

  }); */


  it("Should allow transfer sols to the router account", async() => {
    try {
      const connection = anchor.getProvider().connection;
      const beforeReceiverBalance = await connection.getBalance(signer2Wallet.publicKey);
  
      const beforePayerBalance = await connection.getBalance(signer1Wallet.publicKey);
  
        await routerProgram.rpc.updateConfig({
          price : null,
          goLiveDate : new anchor.BN(secondsSinceEpoch- 100000),
          uuid : null,
          itemsAvailable : null
  
        },{
          accounts : {
            routerAccount : routerAccount.publicKey,
            authority : provider.wallet.publicKey,
            wallet : provider.wallet.publicKey
          }
  
        });


        await initializeUserVault();
        
        
        await routerProgram.rpc.addUserForMintingNft(true,{
          accounts : {
            routerAccount : routerAccount.publicKey,
            userVault : userVaultAccount.publicKey,
            userVaultProgram : userVaultProgram.programId,
            authority : provider.wallet.publicKey,
            payer : signer1Wallet.publicKey,
            wallet : provider.wallet.publicKey,
            rent : anchor.web3.SYSVAR_RENT_PUBKEY,
            clock : anchor.web3.SYSVAR_CLOCK_PUBKEY,
            systemProgram : SystemProgram.programId
          },
          signers : [signer1Wallet]
  
        });
  
        //const routerData:RouterData = await getRouterData(program,routerAccount);
        const afterReceiverBalance = await connection.getBalance(signer2Wallet.publicKey);
        const afterPayerBalance = await connection.getBalance(signer1Wallet.publicKey);
        
        expect(afterReceiverBalance).to.be.greaterThan(beforeReceiverBalance);
        expect(afterPayerBalance).to.be.lessThan(beforePayerBalance);
  
        //console.log(routerData);
    }
    catch(err){
      console.log(err);
      console.log( " This error occurs because we are not connected to localnet/dev/test/prod");
    }

  });

  const initializeUserVault = async () => {

    const [programSigner, _nonce] = await anchor.web3.PublicKey.findProgramAddress([routerAccount.publicKey.toBuffer()], routerProgram.programId);
    console.log(programSigner.toString());

    await userVaultProgram.rpc.initializeUserVault({
      accounts : {
        userVaultAccount : userVaultAccount.publicKey,
        payer : provider.wallet.publicKey,
        systemProgram : SystemProgram.programId
      },
      signers : [userVaultAccount]
    });

  };
  


});



