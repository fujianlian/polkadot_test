/* eslint-disable header/header */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/unbound-method */

// Required imports
const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/keyring');

const ALICE = '5DFxhnHDBdYnPPRa2vUBBLHRpdmT5jLfTJKNQdwyPAK83fwE';
const menmeonic = 'gossip master mandate chunk blouse hammer venue inside jungle social dinner latin';


async function main() {
  // Create the API and wait until ready
  const api = await initApi()

  const keyring = new Keyring({ type: 'sr25519' });

  // Get the nonce for the admin key
  const { nonce } = await api.query.system.account(ALICE);
  // create & add the pair to the keyring with the type and some additional
  // metadata specified
  const pair = keyring.addFromUri(menmeonic, { name: 'first pair' }, 'sr25519');

  console.log('from', pair.address, 'with nonce', nonce.toString());

  api.tx.identitymeModule.didCreate(0x3496, getDidDoc(0x3496))
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

  //console.log(n)

  //const query = await api.query.identitymeModule.didDocMap(62623,);
  //console.log('---')


}

function getDidDoc(ut8) {
  let keys = [
    {
      id: ut8, encrypt_type: ut8, publicKeyHex: "5HpG9w8EBLe5XCrbczpwq5TSXvedjrBGCwqxK1iQ7qUsSWFc"
    },
    {
      id: ut8, encrypt_type: ut8, publicKeyHex: "5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy"
    }
  ]

  let service = [{
    id: ut8, encrypt_type: ut8, serviceEndpoint: ut8
  }]
  let proof = [{ encrypt_type: ut8, signatureValue: ut8, created: ut8 }]
  return {
    context: ut8, id: ut8, version: 1, created: ut8, updated: ut8, publicKey: keys,
    authentication: ut8, recovery: ut8, service: service, proof: proof
  }
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
        did: "u32",
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

main().catch(console.error).finally(() => process.exit());


