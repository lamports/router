# Details

Signer 1 - EsH1qAuQT9QRyZ1pjKWXLbSU8rofUaAbaBzkSKk25scE
SIgner 2 - FgryjzvfqfhRuQMBWZXvFedSgPXMosZMVtxmdxCPEQCh

for i in $(seq 10); do solana-keygen new --no-passphrase -so "vault_secret_${i}.json"; done
