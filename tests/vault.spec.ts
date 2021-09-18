import * as anchor from '@project-serum/anchor';
import {  
  PublicKey,
  SystemProgram,
  Keypair,
  } from "@solana/web3.js";

  import {UpdateUserVault, UserVaultData} from "./models";
  import {getCustomWorkspace} from "./helper";



describe('vault', () => {

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
    const userVaultWorkspace = getCustomWorkspace(signer2Wallet, process.env.USER_VAULT_IDL_PATH, process.env.USER_VAULT_PROGRAM_ID);
 
    const userVaultAccount: Keypair  = anchor.web3.Keypair.generate();

    const program = userVaultWorkspace.program;
    const provider = userVaultWorkspace.provider;
    
    anchor.setProvider(provider);


  it('Is initialized!', async () => {
    const tx = await program.rpc.initializeUserVault({
      accounts : {
        userVaultAccount : userVaultAccount.publicKey,
        payer : provider.wallet.publicKey,
        systemProgram : SystemProgram.programId
      },
      signers : [userVaultAccount]
    });
    console.log("Your transaction signature", tx);
  });


  describe('User Pub Keys into vault', () => {


  
  it("should add next 30 pub keys into the vault ", async () => {
    try {
       let userPubKeys : Array<UpdateUserVault> = [];
         for(let i = 0 ; i< 30; i++){
           const randomKeygen = anchor.web3.Keypair.generate();
           const userVault = {
             userPubKey : randomKeygen.publicKey
           }
     
           userPubKeys.push(userVault);
         }
         await program.rpc.addUserIntoVault(userPubKeys,
         {
           accounts : {
             userVaultAccount : userVaultAccount.publicKey,
             authority : provider.wallet.publicKey,
           }
         });      
     }
     catch(err) {
       console.log(err);
     }     
   });

   it("should add next 30 pub keys into the vault ", async () => {
    try {
       let userPubKeys : Array<UpdateUserVault> = [];
         for(let i = 0 ; i< 30; i++){
           const randomKeygen = anchor.web3.Keypair.generate();
           const userVault = {
             userPubKey : randomKeygen.publicKey
           }
     
           userPubKeys.push(userVault);
         }
         await program.rpc.addUserIntoVault(userPubKeys,
         {
           accounts : {
             userVaultAccount : userVaultAccount.publicKey,
             authority : provider.wallet.publicKey,
           }
         });      
     }
     catch(err) {
       console.log(err);
     }     
   });

   it("should add next 30 pub keys into the vault ", async () => {
    try {
       let userPubKeys : Array<UpdateUserVault> = [];
         for(let i = 0 ; i< 30; i++){
           const randomKeygen = anchor.web3.Keypair.generate();
           const userVault = {
             userPubKey : randomKeygen.publicKey
           }
     
           userPubKeys.push(userVault);
         }
         

         await program.rpc.addUserIntoVault(userPubKeys,
         {
           accounts : {
             userVaultAccount : userVaultAccount.publicKey,
             authority : provider.wallet.publicKey,
           }
         });      
     }
     catch(err) {
       console.log(err);
     }     
   });
   it("should add next 30 pub keys into the vault ", async () => {
    try {
       let userPubKeys : Array<UpdateUserVault> = [];
         for(let i = 0 ; i< 30; i++){
           const randomKeygen = anchor.web3.Keypair.generate();
           const userVault = {
             userPubKey : randomKeygen.publicKey
           }
     
           userPubKeys.push(userVault);
         }
         

         await program.rpc.addUserIntoVault(userPubKeys,
         {
           accounts : {
             userVaultAccount : userVaultAccount.publicKey,
             authority : provider.wallet.publicKey,
           }
         });      
     }
     catch(err) {
       console.log(err);
     }     
   });
   it("should add next 30 pub keys into the vault ", async () => {
    try {
       let userPubKeys : Array<UpdateUserVault> = [];
         for(let i = 0 ; i< 30; i++){
           const randomKeygen = anchor.web3.Keypair.generate();
           const userVault = {
             userPubKey : randomKeygen.publicKey
           }
     
           userPubKeys.push(userVault);
         }
         

         await program.rpc.addUserIntoVault(userPubKeys,
         {
           accounts : {
             userVaultAccount : userVaultAccount.publicKey,
             authority : provider.wallet.publicKey,
           }
         });      
     }
     catch(err) {
       console.log(err);
     }     
   });
   it("should add next 30 pub keys into the vault ", async () => {
    try {
       let userPubKeys : Array<UpdateUserVault> = [];
         for(let i = 0 ; i< 30; i++){
           const randomKeygen = anchor.web3.Keypair.generate();
           const userVault = {
             userPubKey : randomKeygen.publicKey
           }
     
           userPubKeys.push(userVault);
         }
         

         await program.rpc.addUserIntoVault(userPubKeys,
         {
           accounts : {
             userVaultAccount : userVaultAccount.publicKey,
             authority : provider.wallet.publicKey,
           }
         });      
     }
     catch(err) {
       console.log(err);
     }     
   });
   it("should add next 30 pub keys into the vault ", async () => {
    try {
       let userPubKeys : Array<UpdateUserVault> = [];
         for(let i = 0 ; i< 30; i++){
           const randomKeygen = anchor.web3.Keypair.generate();
           const userVault = {
             userPubKey : randomKeygen.publicKey
           }
     
           userPubKeys.push(userVault);
         }
         

         await program.rpc.addUserIntoVault(userPubKeys,
         {
           accounts : {
             userVaultAccount : userVaultAccount.publicKey,
             authority : provider.wallet.publicKey,
           }
         });      
     }
     catch(err) {
       console.log(err);
     }     
   });
   it("should add next 30 pub keys into the vault ", async () => {
    try {
       let userPubKeys : Array<UpdateUserVault> = [];
         for(let i = 0 ; i< 30; i++){
           const randomKeygen = anchor.web3.Keypair.generate();
           const userVault = {
             userPubKey : randomKeygen.publicKey
           }
     
           userPubKeys.push(userVault);
         }
         

         await program.rpc.addUserIntoVault(userPubKeys,
         {
           accounts : {
             userVaultAccount : userVaultAccount.publicKey,
             authority : provider.wallet.publicKey,
           }
         });      
     }
     catch(err) {
       console.log(err);
     }     
   });
   it("should add next 30 pub keys into the vault ", async () => {
    try {
       let userPubKeys : Array<UpdateUserVault> = [];
         for(let i = 0 ; i< 30; i++){
           const randomKeygen = anchor.web3.Keypair.generate();
           const userVault = {
             userPubKey : randomKeygen.publicKey
           }
     
           userPubKeys.push(userVault);
         }
         

         await program.rpc.addUserIntoVault(userPubKeys,
         {
           accounts : {
             userVaultAccount : userVaultAccount.publicKey,
             authority : provider.wallet.publicKey,
           }
         });      
     }
     catch(err) {
       console.log(err);
     }     
   });



   
   it("should add next 30 pub keys into the vault ", async () => {
    try {
       let userPubKeys : Array<UpdateUserVault> = [];
         for(let i = 0 ; i< 30; i++){
           const randomKeygen = anchor.web3.Keypair.generate();
           const userVault = {
             userPubKey : randomKeygen.publicKey
           }
     
           userPubKeys.push(userVault);
         }
         
         await program.rpc.addUserIntoVault(userPubKeys,
         {
           accounts : {
             userVaultAccount : userVaultAccount.publicKey,
             authority : provider.wallet.publicKey,
           }
         });
         const userVaultData: UserVaultData = await getUserVaultData(program, userVaultAccount);
         console.log(userVaultData.usersPubKey.length);
       
     }
     catch(err) {
       console.log(err);
     }     
   });
  });

});



export const getUserVaultData = async (program : any, account : Keypair ) : Promise<UserVaultData> => {
  return program.account.userVaultData.fetch(account.publicKey);
}

