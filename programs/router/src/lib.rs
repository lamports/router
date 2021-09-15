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

    pub fn update_config(ctx: Context<UpdateConfiguration>) -> ProgramResult {
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
    pub current_count: u16, // tracks which pubkey needs nft
}

#[derive(Default, AnchorDeserialize, AnchorSerialize, Clone)]
pub struct ConfigData {
    pub price: u32,
    pub go_live_date: Option<i64>,
}

// update config data
#[derive(Accounts)]
pub struct UpdateConfiguration<'info> {
    #[account(mut , has_one = authority)]
    pub router_account: Account<'info, RouterData>,
    pub authority: AccountInfo<'info>,
}
