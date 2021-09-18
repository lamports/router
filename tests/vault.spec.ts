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
import { getCustomWorkspace, getSigner1Wallet, getSigner2Wallet} from "./helper";


describe("Vault", () => {

    const signer1Wallet = getSigner1Wallet();
    const signer2Wallet = getSigner2Wallet();

    const  workspace = getCustomWorkspace(signer2Wallet, process.env.VAULT_IDL_PATH, process.env.VAULT_PROGRAM_ID);

    const provider = workspace.provider;
    const vaultProgram = workspace.program;
    anchor.setProvider(provider);


    it("Is initialized", async () => {
        await vaultProgram.rpc.initialize({});
    });
});