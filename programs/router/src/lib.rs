use anchor_lang::prelude::*;
//use utils;
use anchor_lang::solana_program::{program::invoke, system_instruction, system_program};
use anchor_lang::Accounts;
use vault::program::Vault;
use vault::{self, AddUserVault, CloseAccount, UpdateUserVault, UserVaultAccount};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

pub mod utils;

#[program]
pub mod router {
    use super::*;
    pub fn initialize_router(
        ctx: Context<InitializeRouter>,
        nft_sub_program_id: Pubkey,
    ) -> ProgramResult {
        let router_account = &mut ctx.accounts.router_account;
        let authority = &mut ctx.accounts.payer;
        router_account.authority = *authority.key;
        router_account.wallet = *ctx.accounts.wallet.key;
        router_account.nft_sub_program_id = nft_sub_program_id;
        router_account.data.current_account_index = 0;
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
            config.items_available = items_available as u32;
        }

        // msg!("Router config data {}", &router_account.config.go_live_date);
        Ok(())
    }

    pub fn add_nft_sub_account(
        ctx: Context<UpdateNftSubAccount>,
        input_data: Vec<NftSubAccount>,
    ) -> ProgramResult {
        let router_account = &mut ctx.accounts.router_account;
        //router_account.data.current_account_index = input_data.len() as u16;
        let nft_vector = &mut router_account.data.sub_accounts;
        for nft_account in input_data {
            nft_vector.push(nft_account);
        }

        Ok(())
    }

    pub fn add_user_for_minting_nft(ctx: Context<MintNft>, mint_number: u32) -> ProgramResult {
        let router_account = &mut ctx.accounts.router_account;
        let clock = &mut ctx.accounts.clock;
        let authority = &mut ctx.accounts.authority;
        let payer = &mut ctx.accounts.payer;

        require!(mint_number < u32::max_value(), ErrorCode::MintMaxError);

        if router_account.config.go_live_date > clock.unix_timestamp {
            // only authority could mint before go live
            if authority.key != payer.key {
                return Err(ErrorCode::RouterNotLiveYet.into());
            }
        }

        if router_account.data.sub_accounts.len() >= 46
            && router_account
                .data
                .sub_accounts
                .last()
                .as_ref()
                .unwrap()
                .current_sub_account_index
                > 240
        {
            return Err(ErrorCode::SaleIsOver.into());
        }

        if router_account.config.items_available < mint_number {
            msg!("Not Enough Items available");
            return Err(ErrorCode::NotEnoughItemsError.into());
        }

        if router_account.config.items_available <= 0 {
            return Err(ErrorCode::SaleIsOver.into());
        }

        if payer.lamports() < router_account.config.price * mint_number as u64 {
            return Err(ErrorCode::NotEnoughSOL.into());
        }

        let router_data: &NftAccountTracker = &router_account.clone().data;

        //require!(router_data.sub_accounts.len() > 0, ErrorCode::NftSubAccountError);

        if router_data.sub_accounts.len() <= 0 {
            return Err(ErrorCode::NoSubAccountError.into());
        }

        let sub_account: &NftSubAccount =
            &router_data.sub_accounts[router_data.current_account_index as usize];

        // check if the account could be added into the vault!!
        if sub_account.current_sub_account_index > 240 {
            return Err(ErrorCode::SubAccountIsFull.into());
        }

        if (sub_account.current_sub_account_index + mint_number as u16) > 240 {
            emit!(SubAccountLimitEvent {
                current_sub_account_index: sub_account.current_sub_account_index
            });
            return Err(ErrorCode::SubAccountLimitError.into());
        }

        // transfer sols from user account to wallet of router
        invoke(
            &system_instruction::transfer(
                &ctx.accounts.payer.key,
                ctx.accounts.wallet.key,
                router_account.config.price * mint_number as u64,
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
        let vault_cpi_ctx = CpiContext::new(vault_program.clone(), vault_account);

        let mut user_accounts: Vec<UpdateUserVault> = Vec::new();

        let mint_range = 0..mint_number;
        for _ in mint_range {
            user_accounts.push(UpdateUserVault {
                user_pub_key: *ctx.accounts.payer.key,
            });
        }

        vault::cpi::add_user_into_vault(vault_cpi_ctx, user_accounts.to_vec())?;

        let router_config = &mut router_account.config;
        router_config.items_available = router_config
            .items_available
            .checked_sub(mint_number)
            .ok_or(ErrorCode::ItemsUnavailableError)?;

        emit!(MintTokenEvent {
            current_account_index: router_data.current_account_index,
            payer_key: *ctx.accounts.payer.to_account_info().key,
        });

        Ok(())
    }

    pub fn update_current_account_index(ctx: Context<UpdateCurrentAccountIndex>) -> ProgramResult {
        let router_data = &mut ctx.accounts.router_account.data;

        router_data
            .current_account_index
            .checked_add(1)
            .ok_or(ErrorCode::NumericalOverflowError)?;

        Ok(())
    }

    pub fn increment_sub_account_index_by_one(ctx: Context<UpdateNftSubAccount>) -> ProgramResult {
        let router_account = &mut ctx.accounts.router_account;
        let authority = ctx.accounts.authority.to_account_info();
        //router_account.data.current_account_index = input_data.len() as u16;

        if router_account.authority != *authority.key {
            return Err(ErrorCode::NotAuthorized.into());
        }

        let current_account_index = router_account.data.current_account_index;

        let nft_sub_account = &mut router_account.data.sub_accounts[current_account_index as usize];

        nft_sub_account.current_sub_account_index = nft_sub_account
            .current_sub_account_index
            .checked_add(1)
            .ok_or(ErrorCode::SubAccountIndexIncrementError)?;

        Ok(())
    }

    pub fn close_sub_account(ctx: Context<CloseSubAccount>) -> ProgramResult {
        require!(
            *ctx.accounts.authority.to_account_info().key == ctx.accounts.router_account.authority,
            ErrorCode::NotAuthorized
        );
        let router_data = &ctx.accounts.router_account.data;
        let sub_account = &router_data.sub_accounts[router_data.current_account_index as usize];
        // remove only if the current is index is not processing the current sub account
        if sub_account.nft_sub_account == *ctx.accounts.vault_account.to_account_info().key {
            return Err(ErrorCode::CannotCloseAccount.into());
        }

        let vault_program = ctx.accounts.vault_program.to_account_info();
        let vault_account = CloseAccount {
            user_vault_account: ctx.accounts.vault_account.clone(),
            authority: ctx.accounts.authority.clone(),
        };
        let vault_cpi_ctx = CpiContext::new(vault_program, vault_account);
        vault::cpi::close_account(vault_cpi_ctx)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeRouter<'info> {
    #[account(init, payer = payer, space = (8 + 50 *40 + 32 + 32 + 46 +32+8 ) as usize)]
    router_account: ProgramAccount<'info, RouterData>,
    payer: AccountInfo<'info>,
    system_program: AccountInfo<'info>,
    #[account(constraint = (wallet.data_is_empty() && wallet.lamports() > 0))]
    wallet: AccountInfo<'info>,
}

#[account]
#[derive(Default)]
pub struct RouterData {
    data: NftAccountTracker,    // nft tracker sum = 40 *40 + 8
    authority: Pubkey,          // 32
    config: ConfigData,         // config sum = 46
    wallet: Pubkey,             // 32
    nft_sub_program_id: Pubkey, //32
}

#[derive(Default, AnchorDeserialize, AnchorSerialize, Clone)]
pub struct NftAccountTracker {
    current_account_index: u16,       //tracks which program id to take in // 8
    sub_accounts: Vec<NftSubAccount>, //40 * nftsubaccount size // 40 * 40
}

#[derive(Default, AnchorDeserialize, AnchorSerialize, Clone)]
pub struct NftSubAccount {
    nft_sub_account: Pubkey,        //32
    current_sub_account_index: u16, // tracks which pubkey needs nft //8
}

#[derive(Default, AnchorDeserialize, AnchorSerialize, Clone)]
pub struct ConfigData {
    price: u64,           //16
    go_live_date: i64,    //8
    uuid: String,         //6
    items_available: u32, //16
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
    authority: AccountInfo<'info>,
    #[account(mut)]
    payer: AccountInfo<'info>,
    #[account(mut)]
    wallet: AccountInfo<'info>,
    rent: Sysvar<'info, Rent>,
    clock: Sysvar<'info, Clock>,
    #[account(address = system_program::ID)]
    system_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct CloseMainAccount<'info> {
    //#[account(mut, has_one=authority, constraint = router_account.authority == *authority.key && authority.key != &Pubkey::new_from_array([0u8; 32]))]
    #[account(mut, close=authority)]
    pub router_account: Account<'info, RouterData>,
    pub authority: AccountInfo<'info>,
    pub router_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct CloseSubAccount<'info> {
    #[account(has_one=authority)]
    router_account: ProgramAccount<'info, RouterData>,
    #[account(mut, close = authority)]
    vault_account: Account<'info, UserVaultAccount>,
    vault_program: Program<'info, Vault>,
    authority: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct UpdateCurrentAccountIndex<'info> {
    #[account(mut , has_one=authority)]
    router_account: ProgramAccount<'info, RouterData>,
    authority: AccountInfo<'info>,
}

#[event]
pub struct MintTokenEvent {
    current_account_index: u16,
    payer_key: Pubkey,
}

#[event]
pub struct ItemsAvailableEvent {
    items_available: u32,
}

#[event]
pub struct SubAccountLimitEvent {
    current_sub_account_index: u16,
}

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
    #[msg("User not added into the vault")]
    UserNotAddedToVault,
    #[msg("Not authorized to update the User Vault")]
    NotAuthorized,
    #[msg("cannot close the sub account")]
    CannotCloseAccount,
    #[msg("Sub account is full, use the next sub account")]
    SubAccountIsFull,
    #[msg("Numerical Overflow")]
    NumericalOverflowError,
    #[msg("Items Unavailable")]
    ItemsUnavailableError,
    #[msg("Could not fetch next sub account")]
    NftSubAccountError,
    #[msg("Could not increment the sub account index")]
    SubAccountIndexIncrementError,
    #[msg("Not enough sub accounts added")]
    NumericalUnderError,
    #[msg("Cannot mint more than max mint")]
    MintMaxError,
    #[msg("Not enough items available")]
    NotEnoughItemsError,
    #[msg("Sub account limit reached, use next sub account")]
    SubAccountLimitError,
    #[msg("No sub accounts present to add user")]
    NoSubAccountError,
}
