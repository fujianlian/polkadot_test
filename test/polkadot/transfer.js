/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/**
 * @ignore Don't show this file in documentation.
 */ /** */

 const { Keyring } = require('@polkadot/api');
 const { cryptoWaitReady } = require('@polkadot/util-crypto');
 
 const {
   createSignedTx,
   createSigningPayload,
   decode,
   deriveAddress,
   getRegistry,
   getTxHash,
   methods,
   POLKADOT_SS58_FORMAT,
 } = require('@substrate/txwrapper');
 
 const from = '5DQ22recSK5WPfoaHA7LDCgMTDQZ59wvomLyvctxzMSySF6Y';
 const menmeonic = 'pink shy decide hurdle gift embrace skull tennis desert control change call';
 const to = '5DDADi9EppQzofb8qvfXku4pBJibC8hkNmwQNEDXkDbJrRrr';
 

const { EXTRINSIC_VERSION } = require('@polkadot/types/extrinsic/v4/Extrinsic');
const fetch = require("node-fetch");

const { createMetadata } = require('@substrate/txwrapper/lib/util');

 /**
  * Entry point of the script. This script assumes a Polkadot node is running
  * locally on `http://localhost:9933`.
  */
 async function main() {
   // Wait for the promise to resolve async WASM
   await cryptoWaitReady();
   // Create a new keyring, and add an "Alice" account
   const keyring = new Keyring();
 
   const alice = keyring.createFromUri(menmeonic)
   console.log(
     "Alice's SS58-Encoded Address:",
     deriveAddress(alice.publicKey, POLKADOT_SS58_FORMAT)
   );
 
   // Construct a balance transfer transaction offline.
   // To construct the tx, we need some up-to-date information from the node.
   // `txwrapper` is offline-only, so does not care how you retrieve this info.
   // In this tutorial, we simply send RPC requests to the node.
   const { block } = await rpcToNode('chain_getBlock');
   const blockHash = await rpcToNode('chain_getBlockHash');
   const genesisHash = await rpcToNode('chain_getBlockHash', [0]);
   const metadataRpc = await rpcToNode('state_getMetadata');
   const { specVersion, transactionVersion } = await rpcToNode(
     'state_getRuntimeVersion'
   );
 
   // Create Polkadot's type registry.
   const registry = getRegistry('Westend', 'westend', specVersion);
 
   // Now we can create our `balances.transfer` unsigned tx. The following
   // function takes the above data as arguments, so can be performed offline
   // if desired.
   const unsigned = methods.balances.transfer(
     {
       value: '90071992547409910',
       dest: to, // Bob
     },
     {
       address: from,
       blockHash,
       blockNumber: registry
         .createType('BlockNumber', block.header.number)
         .toNumber(),
       eraPeriod: 64,
       genesisHash,
       metadataRpc,
       nonce: 0, // Assuming this is Alice's first tx on the chain
       specVersion,
       tip: 0,
       transactionVersion,
     },
     {
       metadataRpc,
       registry,
     }
   );
 
   // Decode an unsigned transaction.
   const decodedUnsigned = decode(
     unsigned,
     {
       metadataRpc,
       registry,
     },
     true
   );
   console.log(
     `\nDecoded Transaction\n  To: ${decodedUnsigned.method.args.dest}\n` +
     `  Amount: ${decodedUnsigned.method.args.value}`
   );
 
   // Construct the signing payload from an unsigned transaction.
   const signingPayload = createSigningPayload(unsigned, { registry });
   console.log(`\nPayload to Sign: ${signingPayload}`);
 
   // Decode the information from a signing payload.
   const payloadInfo = decode(
     signingPayload,
     {
       metadataRpc,
       registry,
     },
     true
   );
   console.log(
     `\nDecoded Transaction\n  To: ${payloadInfo.method.args.dest}\n` +
     `  Amount: ${payloadInfo.method.args.value}`
   );
 
   // Sign a payload. This operation should be performed on an offline device.
   const signature = signWith(alice, signingPayload, {
     metadataRpc,
     registry,
   });
   console.log(`\nSignature: ${signature}`);
 
   // Serialize a signed transaction.
   const tx = createSignedTx(unsigned, signature, { metadataRpc, registry });
   console.log(`\nTransaction to Submit: ${tx}`);
 
   // Derive the tx hash of a signed transaction offline.
   const expectedTxHash = getTxHash(tx);
   console.log(`\nExpected Tx Hash: ${expectedTxHash}`);
 
   // Send the tx to the node. Again, since `txwrapper` is offline-only, this
   // operation should be handled externally. Here, we just send a JSONRPC
   // request directly to the node.
   const actualTxHash = await rpcToNode('author_submitExtrinsic', [tx]);
   console.log(`Actual Tx Hash: ${actualTxHash}`);
 
   // Decode a signed payload.
   const txInfo = decode(
     tx,
     {
       metadataRpc,
       registry,
     },
     true
   );
   console.log(
     `\nDecoded Transaction\n  To: ${txInfo.method.args.dest}\n` +
     `  Amount: ${txInfo.method.args.value}\n`
   );
 }

 /**
 * Send a JSONRPC request to the node at http://localhost:9933.
 *
 * @param method - The JSONRPC request method.
 * @param params - The JSONRPC request params.
 */
function rpcToNode(method, params) {
    return fetch('http://10.200.79.72:10030', {
        body: JSON.stringify({
            id: 1,
            jsonrpc: '2.0',
            method,
            params,
        }),
        headers: {
            'Content-Type': 'application/json',
        },
        method: 'POST',
    })
        .then((response) => response.json())
        .then(({ error, result }) => {
            if (error) {
                throw new Error(
                    `${error.code} ${error.message}: ${JSON.stringify(error.data)}`
                );
            }

            return result;
        });
}

/**
 * Signing function. Implement this on the OFFLINE signing device.
 *
 * @param pair - The signing pair.
 * @param signingPayload - Payload to sign.
 */
function signWith(
    pair,
    signingPayload,
    options
) {
    const { registry, metadataRpc } = options;
    // Important! The registry needs to be updated with latest metadata, so make
    // sure to run `registry.setMetadata(metadata)` before signing.
    registry.setMetadata(createMetadata(registry, metadataRpc));

    const { signature } = registry
        .createType('ExtrinsicPayload', signingPayload, {
            version: EXTRINSIC_VERSION,
        })
        .sign(pair);

    return signature;
}
 
 main().catch((error) => {
   console.error(error);
   process.exit(1);
 });
 