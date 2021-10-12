# Details

Signer 1 - EsH1qAuQT9QRyZ1pjKWXLbSU8rofUaAbaBzkSKk25scE
SIgner 2 - FgryjzvfqfhRuQMBWZXvFedSgPXMosZMVtxmdxCPEQCh

for i in $(seq 10); do solana-keygen new --no-passphrase -so "vault_secret_${i}.json"; done

## Setup

1. Deploy using program_wallet --> anchor build && anchor deploy --provider.wallet ../minter/env/program_wallet.json
2. Find relevant pubkeys using `solana-keygen pubkey <json-file>`
3. Run anchor build and anchor deploy
4. Next fund the program wallet account -
   `solana airdrop 10 GjQBdQ78Qdx7G6aZyq3svr4CmFackaEEWF9MHkPLawje`
5. Next fund the external wallet with some amount because of the minimum balance constraint - otherwise we will get 143 raw constraint violation
   `solana airdrop 1 FNUgRQxnWZeuxaiwXGanzEAZyJasMg95Tw3YHap7wHke`
