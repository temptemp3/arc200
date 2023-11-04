# ARC200.js

Library with examples scripts interacting with ARC200 token through ABI.

## supported implementations

ARC200.js supports all ARC200 complaint smart contracts through its ABI.  

Supported implementations:

* [OpenARC200](https://github.com/temptemp3/arc-200) - Actively maintained and developed, fully complaint, and opensource.

## requirements

* nodejs (npm)
* git

## quickstart

Run the following command lines to quickly get started.

```
git clone git@github.com:cswenor/arc200.git
cd $( basename ${_} .git )
npm i
test -f ".env" || cp -v .env{,.sample}
echo "[!] WALLET_MNEMONIC='XXXX' not updated. See .env"
node index.js
```

## getting starated

### run examples

In the `examples` directory there are scripts that can be run for testing purposes. Note, script may spend VOI.

```
node example/path/to/script.js
```

