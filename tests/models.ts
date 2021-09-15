import {PublicKey } from "@solana/web3.js";
export interface RouterData {
    data : NftAccountTracker;
    authority : PublicKey;
    config : ConfigData;
}


export interface NftAccountTracker {
    currentIndex : number;
    subAccounts : Array<NftSubAccount>;

}

export interface NftSubAccount {
    nftSubAccount : PublicKey;
    currentCount: number;
}

export interface ConfigData {
    price : number;
    goLiveData : any;
}