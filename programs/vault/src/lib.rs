use anchor_lang::prelude::*;
declare_id!("5XcpJgxYgWbjn6mbAXm7njCnGfyzLU2Bgwo2JP7nf4wM");

#[program]
pub mod vault {
    use super::*;
    pub fn initialize_user_vault(ctx: Context<Initialize>) -> ProgramResult {
        let user_vault_account = &mut ctx.accounts.user_vault_account;
        let authority = &mut ctx.accounts.payer;
        user_vault_account.authority = *authority.key;
        Ok(())
    }
    pub fn add_user_into_vault(
        ctx: Context<AddUserVault>,
        data: Vec<UpdateUserVault>,
    ) -> ProgramResult {
        let user_vault_account = ctx.accounts.user_vault_account.clone();
        let authority = ctx.accounts.authority.to_account_info();
        if user_vault_account.authority.key() != *authority.key {
            return Err(ErrorCode::NotAuthorized.into());
        }
        let user_vault_account = &mut ctx.accounts.user_vault_account;
        let users_pub_key = &mut user_vault_account.users_pub_key;

        for update_user_vault in data {
            users_pub_key.push(update_user_vault.user_pub_key);
        }
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = payer, space= 8+310*32)]
    user_vault_account: Account<'info, UserVaultAccount>,
    payer: Signer<'info>,
    system_program: Program<'info, System>,
}

#[account]
#[derive(Default)]
pub struct UserVaultAccount {
    pub authority: Pubkey,
    pub users_pub_key: Vec<Pubkey>,
}

#[derive(Default, AnchorDeserialize, AnchorSerialize, Clone)]
pub struct UpdateUserVault {
    pub user_pub_key: Pubkey,
}

#[derive(Accounts)]
pub struct AddUserVault<'info> {
    #[account(mut, has_one=authority, constraint = user_vault_account.authority == *authority.key && authority.key != &Pubkey::new_from_array([0u8; 32]))]
    //#[account(mut)]
    pub user_vault_account: Account<'info, UserVaultAccount>,
    pub authority: Signer<'info>,
}

#[error]
pub enum ErrorCode {
    #[msg("Not authorized to update the User Vault")]
    NotAuthorized,
}
