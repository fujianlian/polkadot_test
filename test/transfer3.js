const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/keyring');

// Some constants we are using in this sample
var ALICE = '';
const menmeonic = 'wine sight express spawn bless sand legal nasty strong notice drill elegant';

async function main() {
  // Create the API and wait until ready
  const api = await initApi()

  const keyring = new Keyring({ type: 'ecdsa' });

  // Get the nonce for the admin key
  // create & add the pair to the keyring with the type and some additional
  // metadata specified
  const pair = keyring.addFromUri(menmeonic, { name: 'zhang' }, 'ecdsa');
  ALICE = pair.address;
  const { nonce } = await api.query.system.account(ALICE);

  console.log('from', pair.address, 'with nonce', nonce.toString());

  dide(api, pair, nonce)


}

function dide(api, pair, nonce) {
  let did = "0x6469643a77783a63323130333234353839623337643430313961663362346364323336646533626561613636353563"
  try {
    api.tx.credentialModule
      .approveIssuer(did)
      .signAndSend(pair, { nonce }, ({ events = [], status }) => {
        if (status.isInBlock) {
          events.forEach(({ event: { data, method, section }, phase }) => {
            let a = phase.toString() + `: ${section}.${method}` + data.toString()
            console.log('\t', a);
            if (method == "ApproveIssuer") {
              let info = dataProcessing.judgeResult(data[1].toString())
              resolve(info)
            } else if (method == "ExtrinsicFailed") {
              let info = { success: false, reason: a }
              resolve(info)
            }
          });
        } else if (status.isFinalized) {
          send("log", 'Finalized block hash：' + status.asFinalized.toHex());
        }
      });
  } catch (err) {
    console.log("-----------");
    console.log("error", err.message);
    console.log("-----------");

  }
}
function didCreate(api, pair, nonce) {
  let did = "did:wx:3344443ddww333"
  console.log(did)

  try {
    api.tx.identitymeModule
      .didCreate(did, getDidDoc(did))
      .signAndSend(pair, { nonce }, ({ events = [], status, isError }) => {

        console.log('Transaction status:', status.type);
        if (status.isInBlock) {
          console.log('Included at block hash', status.asInBlock.toHex());
          console.log('Events:');
          events.forEach(({ event: { data, method, section }, phase }) => {
            if (method == "CreateDid") {
              console.log('data[1]', data[1].toString())
            }

            console.log('\t', phase.toString(), `: ${section}.${method}`, data.toString());
          });
        } else if (status.isFinalized) {
          console.log('Finalized block hash', status.asFinalized.toHex());
          process.exit(0);
        }
      });
  } catch (err) {
    console.log("-----------");
    console.log("error", err.message);
    console.log("-----------");

  }
}

function getDidDoc(did) {
  let keys = [
    {
      id: did, encrypt_type: did, publicKeyHex: ALICE
    },
    {
      id: did, encrypt_type: did, publicKeyHex: ALICE
    }
  ]
  let service = [{
    id: did, encrypt_type: did, serviceEndpoint: did
  }]
  let proof = [{ encrypt_type: did, signatureValue: did, creator: did }]
  return {
    context: did, id: did, version: 1, created: did, updated: did, publicKey: keys,
    authentication: did, recovery: did, service: service, proof: proof
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
