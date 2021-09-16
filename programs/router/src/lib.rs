use anchor_lang::prelude::*;
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

mod utils;

#[program]
pub mod router {
    use super::*;
    pub fn initialize_router(ctx: Context<InitializeRouter>) -> ProgramResult {
        let router_account = &mut ctx.accounts.router_account;
        let authority = &mut ctx.accounts.payer;
        router_account.authority = *authority.key;
        //router_account.to_account_info().da
        Ok(())
    }

    pub fn update_config(
        ctx: Context<UpdateConfiguration>,
        input_data: RouterData,
    ) -> ProgramResult {
        let router_account = &mut ctx.accounts.router_account;
        let config = &mut router_account.config;
        config.price = input_data.config.price;
        config.go_live_date = input_data.config.go_live_date;

        let account_data = &mut router_account.data;
        account_data.current_index = input_data.data.current_index;
        account_data.sub_accounts = input_data.data.sub_accounts;

        msg!("Router config data {}", &router_account.config.go_live_date);
        Ok(())
    }

    pub fn add_nft_sub_account(
        ctx: Context<UpdateNftSubAccount>,
        input_data: Vec<NftSubAccount>,
    ) -> ProgramResult {
        let router_account = &mut ctx.accounts.router_account;
        let nft_vector = &mut router_account.data.sub_accounts;

        for nft_account in input_data {
            nft_vector.push(nft_account);
        }

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeRouter<'info> {
    #[account(init, payer = payer, space = (8 + 30 *72 + 8 + 8 + 30 ) as usize)]
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
    config: ConfigData,      // config sum = 30
}

#[derive(Default, AnchorDeserialize, AnchorSerialize, Clone)]
pub struct NftAccountTracker {
    current_index: u16,               //tracks which program id to take in // 8
    sub_accounts: Vec<NftSubAccount>, //30 * nftsubaccount size // 30 * 72
}

#[derive(Default, AnchorDeserialize, AnchorSerialize, Clone)]
pub struct NftSubAccount {
    nft_sub_account: Pubkey,    //32
    nft_sub_program_id: Pubkey, //32
    current_count: u16,         // tracks which pubkey needs nft //8
}

#[derive(Default, AnchorDeserialize, AnchorSerialize, Clone)]
pub struct ConfigData {
    price: u32,           //8
    go_live_date: i64,    //8
    uuid: String,         //6
    items_available: u64, //8
}

// update config data
#[derive(Accounts)]
pub struct UpdateConfiguration<'info> {
    #[account(mut, has_one=authority)]
    router_account: ProgramAccount<'info, RouterData>,
    #[account(signer)]
    authority: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct UpdateNftSubAccount<'info> {
    #[account(mut, has_one=authority)]
    router_account: ProgramAccount<'info, RouterData>,
    #[account(signer)]
    authority: AccountInfo<'info>,
}

pub const CONFIG_ARRAY_LENGTH: usize = 8 + 32 + 8 + 8 + 8 + 40 * 30;

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
}
