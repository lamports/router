require("dotenv").config();
import * as anchor from '@project-serum/anchor';
import {  
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Keypair,
  } from "@solana/web3.js";
import {assert, expect} from "chai";

import { Workspace} from "./models";
import { getCustomWorkspace, getSigner1Wallet, getSigner2Wallet} from "./helper";
import {UpdateUserVault, UserVaultData} from "./models";


describe("Vault", () => {

    const signer1Wallet = getSigner1Wallet();
    const signer2Wallet = getSigner2Wallet();
    const  workspace:Workspace = getCustomWorkspace(signer2Wallet, process.env.VAULT_IDL_PATH, process.env.VAULT_PROGRAM_ID);
    const  routerWork = getCustomWorkspace(signer2Wallet, process.env.ROUTER_IDL_PATH, process.env.ROUTER_PROGRAM_ID);

   const provider = workspace.provider;

    

    const vaultProgram = workspace.program;

    //const vaultProgram = anchor.workspace.Vault;
    anchor.setProvider(provider);

    const userVaultAccount:Keypair = anchor.web3.Keypair.generate();
    it("Is initialized", async () => {

    //console.log(await vaultProgram.account.userVaultAccount.createInstruction(userVaultAccount));
    //const [programSigner, bump] = await anchor.web3.PublicKey.findProgramAddress([provider.wallet.publicKey.toBuffer()], vaultProgram.programId);

        try{
            const tx = await vaultProgram.rpc.initializeUserVault({
                accounts : {
                    userVaultAccount : userVaultAccount.publicKey,
                    payer : provider.wallet.publicKey,
                    systemProgram : SystemProgram.programId
                },
                //instructions : [await vaultProgram.account.userVaultAccount.createInstruction(userVaultAccount)],
                signers : [userVaultAccount]
            });
            console.log("Your transaction signature", tx);      
        }
        catch(err){
            console.log(err);
        }
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
               await vaultProgram.rpc.addUserIntoVault(userPubKeys,
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
               await vaultProgram.rpc.addUserIntoVault(userPubKeys,
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
               
      
               await vaultProgram.rpc.addUserIntoVault(userPubKeys,
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
               
      
               await vaultProgram.rpc.addUserIntoVault(userPubKeys,
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
               
      
               await vaultProgram.rpc.addUserIntoVault(userPubKeys,
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
               
      
               await vaultProgram.rpc.addUserIntoVault(userPubKeys,
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
               
      
               await vaultProgram.rpc.addUserIntoVault(userPubKeys,
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
               
      
               await vaultProgram.rpc.addUserIntoVault(userPubKeys,
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
               
      
               await vaultProgram.rpc.addUserIntoVault(userPubKeys,
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
               
               await vaultProgram.rpc.addUserIntoVault(userPubKeys,
               {
                 accounts : {
                   userVaultAccount : userVaultAccount.publicKey,
                   authority : provider.wallet.publicKey,
                 }
               });
               const userVaultData: UserVaultData = await getUserVaultData(vaultProgram, userVaultAccount);
               console.log(userVaultData.usersPubKey.length);
             
           }
           catch(err) {
             console.log(err);
           }     
         });
        });
      
});

export const getUserVaultData = async (program : any, account : Keypair ) : Promise<UserVaultData> => {
    return program.account.userVaultAccount.fetch(account.publicKey);
  }