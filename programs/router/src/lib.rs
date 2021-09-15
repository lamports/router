use anchor_lang::prelude::*;
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod router {
    use super::*;
    pub fn initialize_router(ctx: Context<InitializeRouter>) -> ProgramResult {
        let router_account = &mut ctx.accounts.router_account;
        let authority = &mut ctx.accounts.user;
        router_account.authority = *authority.key;
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
        input_data: NftSubAccount,
    ) -> ProgramResult {
        let router_account = &mut ctx.accounts.router_account;
        let nft_vector = &mut router_account.data.sub_accounts;
        nft_vector.push(input_data);

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeRouter<'info> {
    #[account(init, payer = user, space = (8+32+8+8+8+40*30) as usize )]
    pub router_account: ProgramAccount<'info, RouterData>,
    pub user: AccountInfo<'info>,
    pub system_program: AccountInfo<'info>,
}

#[account]
#[derive(Default)]
pub struct RouterData {
    pub data: NftAccountTracker,
    pub authority: Pubkey,
    pub config: ConfigData,
}

#[derive(Default, AnchorDeserialize, AnchorSerialize, Clone)]
pub struct NftAccountTracker {
    pub current_index: u16, //tracks which program id to take in
    sub_accounts: Vec<NftSubAccount>,
}

#[derive(Default, AnchorDeserialize, AnchorSerialize, Clone)]
pub struct NftSubAccount {
    pub nft_sub_account: Pubkey,
    pub nft_sub_program_id: Pubkey,
    pub current_count: u16, // tracks which pubkey needs nft
}

#[derive(Default, AnchorDeserialize, AnchorSerialize, Clone)]
pub struct ConfigData {
    pub price: u32,
    pub go_live_date: u32,
}

// update config data
#[derive(Accounts)]
pub struct UpdateConfiguration<'info> {
    #[account(mut, has_one=authority)]
    pub router_account: Account<'info, RouterData>,
    #[account(signer)]
    pub authority: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct UpdateNftSubAccount<'info> {
    #[account(mut, has_one=authority)]
    pub router_account: Account<'info, RouterData>,
    #[account(signer)]
    pub authority: AccountInfo<'info>,
}
