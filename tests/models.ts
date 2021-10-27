import { PublicKey } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";

export interface RouterData {
  data: NftAccountTracker;
  authority: PublicKey;
  config: ConfigData;
  wallet: PublicKey;
}

export interface NftAccountTracker {
  currentAccountIndex: number;
  subAccounts: Array<NftSubAccount>;
}

export interface NftSubAccount {
  nftSubAccount: PublicKey;
  currentSubAccountIndex: number;
}

export interface ConfigData {
  price: number;
  goLiveDate: any;
  uuid: string;
  itemsAvailable: number;
}

export interface Workspace {
  provider: anchor.Provider;
  program: anchor.Program;
}

//type usize = number;

export interface UpdateUserVault {
  userPubKey: PublicKey;
}

export interface UserVaultData {
  authority: PublicKey;
  usersPubKey: Array<PublicKey>;
}
