/* eslint-disable header/header */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/unbound-method */

// Import the API
const { ApiPromise, WsProvider } = require('@polkadot/api');

async function main () {
 // Initialise the provider to connect to the local node
 const provider = new WsProvider('ws://chain.me.hashkey.com/polkadot/ws/');

 // Create the API and wait until ready
 const api = await ApiPromise.create({ provider });

  // We only display a couple, then unsubscribe
  let count = 0;

  // Subscribe to the new headers on-chain. The callback is fired when new headers
  // are found, the call itself returns a promise with a subscription that can be
  // used to unsubscribe from the newHead subscription
  const unsubscribe = await api.rpc.chain.subscribeNewHeads((header) => {
    console.log(`Chain is at block: #${header.number}`);

    if (++count === 256) {
      unsubscribe();
      process.exit(0);
    }
  });
}

main().catch(console.error);