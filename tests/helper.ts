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



export const getSigner1Wallet = () => {  
    return anchor.web3.Keypair.fromSecretKey(
        new Uint8Array(
        JSON.parse(require("fs").readFileSync(process.env.SIGNER_1_WALLET, "utf8"))
        )
    );

}

export const getSigner2Wallet = () => {
    return anchor.web3.Keypair.fromSecretKey(
        new Uint8Array(
            JSON.parse(require("fs").readFileSync(process.env.SIGNER_2_WALLET, "utf8"))
        )
    );
}

export const getCustomWorkspace = (wallet: Keypair, idlPath : string, programIdStr : string) : Workspace => {
   
    const connection = new anchor.web3.Connection(
        process.env.LOCAL_NET,
        "recent"
    );
    const walletWrapper = new anchor.Wallet(wallet);
    const provider = new anchor.Provider(connection, walletWrapper, {
    preflightCommitment: "recent",
    });

    const idl = JSON.parse(require('fs').readFileSync(idlPath, 'utf8'));
    const programId = new anchor.web3.PublicKey(
        programIdStr
    );
    const program = new anchor.Program(idl, programId, provider);

    return {
        provider : provider,
        program : program
    }
} 