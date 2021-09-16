import {PublicKey } from "@solana/web3.js";
export interface RouterData {
    data : NftAccountTracker;
    authority : PublicKey;
    config : ConfigData;
    wallet : PublicKey;
}


export interface NftAccountTracker {
    currentProgramIndex : number;
    subAccounts : Array<NftSubAccount>;

}

export interface NftSubAccount {
    nftSubAccount : PublicKey;
    nftSubProgramId : PublicKey;
    currentSubAccountIndex: number;
}

export interface ConfigData {
    price : number;
    goLiveDate : any;
    uuid: string;
    itemsAvailable : number
}

//type usize = number;