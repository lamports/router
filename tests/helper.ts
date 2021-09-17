require("dotenv").config();
import {Keypair} from "@solana/web3.js";
import { RouterData, Workspace } from "./models";
import * as anchor from '@project-serum/anchor';

export const getRouterData = async (program : any, account : Keypair ) : Promise<RouterData> => {
    return program.account.routerData.fetch(account.publicKey);
}



export const getDefaultAnchorWorkspace = () : Workspace => {
    const provider : anchor.Provider = anchor.Provider.local(); 
    const program = anchor.workspace.Router;

    return {
        provider : provider,
        program : program
    }
}

export const getCustomWorkspace = () : Workspace => {
    const signer2Wallet = anchor.web3.Keypair.fromSecretKey(
        new Uint8Array(
          JSON.parse(require("fs").readFileSync(process.env.SIGNER_2_WALLET, "utf8"))
        )
    );

    const connection = new anchor.web3.Connection(
        process.env.LOCAL_NET,
        "recent"
    );
    const programId = new anchor.web3.PublicKey(
    process.env.DEPLOYED_PROGRAM_ID
    );
    const idl = JSON.parse(require('fs').readFileSync(process.env.IDL_PATH, 'utf8'));
    const walletWrapper = new anchor.Wallet(signer2Wallet);
    const provider = new anchor.Provider(connection, walletWrapper, {
    preflightCommitment: "recent",
    });
    const program = new anchor.Program(idl, programId, provider);

    return {
        provider : provider,
        program : program
    }
}

