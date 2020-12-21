/* eslint-disable header/header */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-floating-promises */

// Import the API
const { ApiPromise, WsProvider } = require('@polkadot/api');

// Known account we want to use (available on dev chain, with funds)
const Alice = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

async function main () {
   // Initialise the provider to connect to the local node
 const provider = new WsProvider('ws://chain.me.hashkey.com/polkadot/ws/');

 // Create the API and wait until ready
 const api = await ApiPromise.create({ provider });

  // Retrieve the initial balance. Since the call has no callback, it is simply a promise
  // that resolves to the current on-chain value
  let { data: { free: previousFree }, nonce: previousNonce } = await api.query.system.account(Alice);

  console.log(`${Alice} has a balance of ${previousFree}, nonce ${previousNonce}`);
  console.log(`You may leave this example running and start example 06 or transfer any value to ${Alice}`);

  // Here we subscribe to any balance changes and update the on-screen value
  api.query.system.account(Alice, ({ data: { free: currentFree }, nonce: currentNonce }) => {
    // Calculate the delta
    const change = currentFree.sub(previousFree);

    // Only display positive value changes (Since we are pulling `previous` above already,
    // the initial balance change will also be zero)
    if (!change.isZero()) {
      console.log(`New balance change of ${change}, nonce ${currentNonce}`);

      previousFree = currentFree;
      previousNonce = currentNonce;
    }
  });
}

function didCreate(api, pair, nonce) {
  let ut8 = [22, 22]
  api.tx.identitymeModule
    .didCreate(ut8)
    .signAndSend(pair, { nonce }, ({ events = [], status }) => {
      console.log('Transaction status:', status.type);
      if (status.isInBlock) {
        console.log('Included at block hash', status.asInBlock.toHex());
        console.log('Events:');
        events.forEach(({ event: { data, method, section }, phase }) => {
          console.log('\t', phase.toString(), `: ${section}.${method}`, data.toString());
        });
      } else if (status.isFinalized) {
        console.log('Finalized block hash', status.asFinalized.toHex());
        process.exit(0);
      }
    });
}
main().catch(console.error);
