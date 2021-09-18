use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod vault {
    use super::*;
    pub fn initialize_user_vault(ctx: Context<Initialize>) -> ProgramResult {
        let user_vault_account = &mut ctx.accounts.user_vault_account;
        let authority = &mut ctx.accounts.payer;
        user_vault_account.authority = *authority.key;
        Ok(())
    }

    pub fn add_user_into_vault(ctx : Context<AddUserVault> , data : Vec<UpdateUserVault>) -> ProgramResult{

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
    #[account(init, payer = payer, space = (8 + 32 + 32*310) as usize)]
    user_vault_account: Account<'info, UserVaultData>,
    payer: Signer<'info>,
    system_program: Program<'info, System>,
}

#[account]
#[derive(Default)]
pub struct UserVaultData {
    pub authority: Pubkey,
    pub users_pub_key: Vec<Pubkey>,
}

//update 
#[derive(Accounts)]
pub struct AddUserVault<'info> {
    #[account(mut, has_one = authority)]
    user_vault_account : ProgramAccount<'info, UserVaultData>,
    authority :Signer<'info>
}

#[derive(Default, AnchorDeserialize, AnchorSerialize, Clone)]
pub struct UpdateUserVault {
    user_pub_key : Pubkey
}
