use anchor_lang::prelude::*;
//use utils;
use anchor_lang::solana_program::{program::invoke, system_instruction, system_program};
use vault::program::Vault;
use vault::{self, AddUserVault, UpdateUserVault, UserVaultAccount};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

pub mod utils;

#[program]
pub mod router {
    use super::*;
    pub fn initialize_router(ctx: Context<InitializeRouter>) -> ProgramResult {
        let router_account = &mut ctx.accounts.router_account;
        let authority = &mut ctx.accounts.payer;
        router_account.authority = *authority.key;
        router_account.wallet = *ctx.accounts.wallet.key;
        //router_account.to_account_info().da
        Ok(())
    }

    pub fn update_config(
        ctx: Context<UpdateConfiguration>,
        input_data: UpdateConfigData,
    ) -> ProgramResult {
        let router_account = &mut ctx.accounts.router_account;
        let config = &mut router_account.config;

        if let Some(price) = input_data.price {
            config.price = price as u64;
        }

        if let Some(go_live_date) = input_data.go_live_date {
            config.go_live_date = go_live_date;
        }
        if let Some(uuid) = input_data.uuid {
            config.uuid = uuid;
        }
        if let Some(items_available) = input_data.items_available {
            config.items_available = items_available as u64;
        }

        // msg!("Router config data {}", &router_account.config.go_live_date);
        Ok(())
    }

    pub fn add_nft_sub_account(
        ctx: Context<UpdateNftSubAccount>,
        input_data: Vec<NftSubAccount>,
    ) -> ProgramResult {
        let router_account = &mut ctx.accounts.router_account;
        router_account.data.current_program_index = input_data.len() as u16;
        let nft_vector = &mut router_account.data.sub_accounts;
        for nft_account in input_data {
            nft_vector.push(nft_account);
        }

        Ok(())
    }

    pub fn add_user_for_minting_nft(ctx: Context<MintNft>) -> ProgramResult {
        let router_account = &mut ctx.accounts.router_account;
        let clock = &mut ctx.accounts.clock;
        let authority = &mut ctx.accounts.authority;
        let payer = &mut ctx.accounts.payer;

        if router_account.config.go_live_date > clock.unix_timestamp {
            // only authority could mint before go live
            if authority.key != payer.key {
                return Err(ErrorCode::RouterNotLiveYet.into());
            }
        }

        if router_account.data.sub_accounts.len() >= 30
            && router_account
                .data
                .sub_accounts
                .last()
                .as_ref()
                .unwrap()
                .current_sub_account_index
                >= 300
        {
            return Err(ErrorCode::SaleIsOver.into());
        }

        if router_account.config.items_available <= 0 {
            return Err(ErrorCode::SaleIsOver.into());
        }

        if payer.lamports() < router_account.config.price {
            return Err(ErrorCode::NotEnoughSOL.into());
        }

        // transfer sols from user account to wallet of router
        invoke(
            &system_instruction::transfer(
                &ctx.accounts.payer.key,
                ctx.accounts.wallet.key,
                router_account.config.price,
            ),
            &[
                ctx.accounts.payer.clone(),
                ctx.accounts.wallet.clone(),
                ctx.accounts.system_program.clone(),
            ],
        )?;

        // add the user into the program account
        let vault_program = ctx.accounts.vault_program.to_account_info();
        let vault_account = AddUserVault {
            user_vault_account: ctx.accounts.vault_account.clone(),
            authority: ctx.accounts.authority.clone(),
        };
        let vault_cpi_ctx = CpiContext::new(vault_program, vault_account);
        let data: UpdateUserVault = UpdateUserVault {
            user_pub_key: *ctx.accounts.payer.key,
        };

        vault::cpi::add_user_into_vault(vault_cpi_ctx, [data].to_vec())?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeRouter<'info> {
    #[account(init, payer = payer, space = (8 + 30 *72 + 8 + 8 + 46 +8 ) as usize)]
    router_account: ProgramAccount<'info, RouterData>,
    payer: AccountInfo<'info>,
    system_program: AccountInfo<'info>,
    #[account(constraint = (wallet.data_is_empty() && wallet.lamports() > 0))]
    wallet: AccountInfo<'info>,
}

#[account]
#[derive(Default)]
pub struct RouterData {
    data: NftAccountTracker, // nft tracker sum = 30 *72 + 8
    authority: Pubkey,       // 8
    config: ConfigData,      // config sum = 46
    wallet: Pubkey,          // 8
}

#[derive(Default, AnchorDeserialize, AnchorSerialize, Clone)]
pub struct NftAccountTracker {
    current_program_index: u16,       //tracks which program id to take in // 8
    sub_accounts: Vec<NftSubAccount>, //30 * nftsubaccount size // 30 * 72
}

#[derive(Default, AnchorDeserialize, AnchorSerialize, Clone)]
pub struct NftSubAccount {
    nft_sub_account: Pubkey,        //32
    nft_sub_program_id: Pubkey,     //32
    current_sub_account_index: u16, // tracks which pubkey needs nft //8
}

#[derive(Default, AnchorDeserialize, AnchorSerialize, Clone)]
pub struct ConfigData {
    price: u64,           //16
    go_live_date: i64,    //8
    uuid: String,         //6
    items_available: u64, //16
}

// update config data
#[derive(Accounts)]
pub struct UpdateConfiguration<'info> {
    #[account(mut, has_one=authority, constraint= *authority.key == router_account.authority.key() )]
    router_account: ProgramAccount<'info, RouterData>,
    #[account(signer)]
    authority: AccountInfo<'info>,
}

#[derive(Default, AnchorDeserialize, AnchorSerialize, Clone)]
pub struct UpdateConfigData {
    price: Option<u32>,           //8 // but this is stored as u64
    go_live_date: Option<i64>,    //8
    uuid: Option<String>,         //6
    items_available: Option<u32>, //8 // but this is stored as u64
}

#[derive(Accounts)]
pub struct UpdateNftSubAccount<'info> {
    #[account(mut, has_one=authority)]
    router_account: ProgramAccount<'info, RouterData>,
    #[account(signer)]
    authority: AccountInfo<'info>,
}

// mint nft Account
// this needs to be changing and security needs to be changed as well
#[derive(Accounts)]
pub struct MintNft<'info> {
    #[account(mut, has_one= authority)]
    router_account: ProgramAccount<'info, RouterData>,
    #[account(mut)]
    vault_account: Account<'info, UserVaultAccount>,
    vault_program: Program<'info, Vault>,
    authority: Signer<'info>,
    #[account(mut, signer)]
    payer: AccountInfo<'info>,
    #[account(mut)]
    wallet: AccountInfo<'info>,
    rent: Sysvar<'info, Rent>,
    clock: Sysvar<'info, Clock>,
    #[account(address = system_program::ID)]
    system_program: AccountInfo<'info>,
}

//pub const CONFIG_ARRAY_LENGTH: usize = 8 + 32 + 8 + 8 + 8 + 40 * 30;

#[error]
pub enum ErrorCode {
    #[msg("Account does not have correct owner!")]
    IncorrectOwner,
    #[msg("Account is not initialized!")]
    Uninitialized,
    #[msg("Not enough SOL to pay for this minting")]
    NotEnoughSOL,
    #[msg("Token transfer failed")]
    TokenTransferFailed,
    #[msg("We are not live yet")]
    RouterNotLiveYet,
    #[msg("Sale is over")]
    SaleIsOver,
}
