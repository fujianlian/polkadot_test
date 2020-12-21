const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/keyring');

// Some constants we are using in this sample
const ALICE = '5DwQSSQ1HCfLP15sPSLhU3MGdu4gswLHasDsKXRKbiiV1a1c';
const TO = '5GwgKXBbRNALZPj3e3D78CNuipSXRcc9qpvrbKCR9AaJP41q';
const menmeonic = 'planet security demand stove hedgehog diary wine consider pepper arrange level food';


const AMOUNT = 100000000;// / 10^12;

async function main () {
  // Create the API and wait until ready
  const api = await initApi();

  const keyring = new Keyring({ type: 'ecdsa'});


  // Get the nonce for the admin key
  const { nonce } = await api.query.system.account(ALICE);
  console.log(nonce)
  console.log(nonce.toString())
  // create & add the pair to the keyring with the type and some additional
  // metadata specified
  const pair = keyring.addFromUri(menmeonic, { name: 'first pair' }, 'ecdsa');

  console.log('Sending', AMOUNT, 'from', pair.address, 'to', TO, 'with nonce', nonce.toString());

  // Do the transfer and track the actual status
  api.tx.balances
    .transfer(TO, AMOUNT)
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

async function initApi() {
  const provider = new WsProvider('ws://127.0.0.1:9944');
  // Create the API and wait until ready
  const api = await ApiPromise.create({
    provider: provider,
    types: {
      Address: "AccountId",
      LookupSource: "AccountId",
      Issuer: {
        did: "Vec<u8>",
        website: "Vec<u8>",
        endpoint: "Vec<u8>",
        short_description: "Vec<u8>",
        long_description: "Vec<u8>",
        service: "Vec<u32>",
        request_data: "Vec<u8>",
      },
      DidPublicKey: {
        id: "Vec<u8>",
        encrypt_type: "Vec<u8>",
        publicKeyHex: "T::AccountId"
      },
      DidService: {
        id: "Vec<u8>",
        encrypt_type: "Vec<u8>",
        serviceEndpoint: "Vec<u8>"
      },
      DidProof: {
        encrypt_type: "Vec<u8>",
        creator: "Vec<u8>",
        signatureValue: "Vec<u8>"
      },
      DidDoc: {
        context: "Vec<u8>",
        id: "Vec<u8>",
        version: "u32",
        created: "Vec<u8>",
        updated: "Vec<u8>",
        publicKey: "Vec<DidPublicKey>",
        authentication: "Vec<u8>",
        recovery: "Vec<u8>",
        service: "Vec<DidService>",
        proof: "Vec<DidProof>"
      },
      ServiceType: {
        _enum: ["RealName", "FingerPrint", "Enterprise", "Business", "VIP"]
      },
      Status: {
        _enum: ["UnRegistered", "Registered"]
      },
      PendingStatus: {
        _enum: ["NotProcessed", "Processed", "GenisisStatus"]
      },
      Pending: {
        did: "u32",
        service: "u32",
        credentials_list: "Vec<(PendingStatus, u32, Vec<u8>)>"
      }
    }
  });
  return api
}

main().catch(console.error);
