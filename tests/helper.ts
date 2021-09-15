import {Keypair} from "@solana/web3.js";
import { RouterData } from "./models";

export const getRouterData = async (program : any, account : Keypair ) : Promise<RouterData> => {
    return program.account.routerData.fetch(account.publicKey);
}

