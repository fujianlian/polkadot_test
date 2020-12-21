const {
  createSignedTx,
  createSigningPayload,
  getRegistry,
  getTxHash,
  methods
} = require("@substrate/txwrapper");
const { TypeRegistry } = require("@polkadot/types");
const {
  keyExtractSuri,
  mnemonicGenerate,
  cryptoWaitReady,
  checkAddress,
  blake2AsU8a,
  blake2AsHex
} = require("@polkadot/util-crypto");

const { stringToU8a, u8aToHex, hexToU8a } = require('@polkadot/util');

const { ApiPromise, WsProvider } = require('@polkadot/api');
const { EXTRINSIC_VERSION } = require('@polkadot/types/extrinsic/v4/Extrinsic');

// 存储构造交易的临时数据，用于签名和序列化交易多处使用
let extrinsicContainer = {};
const { Keyring } = require('@polkadot/keyring');
const fetch = require("node-fetch");
const keyring = new Keyring({ ss58Format: 2, type: 'ecdsa' });
// Some constants we are using in this sample
var ALICE = '';
const from = '5DwQSSQ1HCfLP15sPSLhU3MGdu4gswLHasDsKXRKbiiV1a1c';
const menmeonic = 'planet security demand stove hedgehog diary wine consider pepper arrange level food';

async function main() {
  // Create the API and wait until ready
  const api = await initApi()
  
   createUnsignedDidCreate(api)
}

const {
  createMethod
} = require("@substrate/txwrapper/lib/util");

function didCreate(
  args,
  info,
  options
) {
  return createMethod(
    {
      method: {
        args,
        name: 'didCreate',
        pallet: 'identitymeModule',
      },
      ...info,
    },
    options
  );
}

/// 构造未签名交易
async function createUnsignedDidCreate(api) {
  const did = 'did:wx:3ruhfwedddhrgjdfb12rgddffd111'
  const did_doc = '{"context":"https://zhuanlan.zhihu.com/p/77290826","id":"did:wx:3ruhfwedddhrgjdfb12rgddffd111","version":1,"created":"2020-12-17 10:42:51.700371","updated":"","publicKey":[{"id":"main001","encrypt_type":"Secp256k1","publicKeyHex":"5DwQSSQ1HCfLP15sPSLhU3MGdu4gswLHasDsKXRKbiiV1a1c"},{"id":"recover001","encrypt_type":"Secp256k1","publicKeyHex":"5H88kjddXeJQn3jWDzEJNi2kiwtJQcVxzuqccLhdwn1fHc59"}],"authentication":"main001","recovery":"recover001","service":[{"id":"service001","encrypt_type":"Secp256k1","serviceEndpoint":"https://identityhub.wx"}],"proof":[{"encrypt_type":"Secp256k1","creator":"","signatureValue":"2CXtkRTvhkxkEqexaFACuP4Y7rac"}]}'
  const rpcEndpoint = 'http://127.0.0.1:10991'
  const pair = keyring.addFromUri(menmeonic);
  const { nonce } = await api.query.system.account(pair.address);
  const options = { tip: 0, eraPeriod: 64, nonce: nonce.toString() }

  try {
    const { block } = await rpcToNode(rpcEndpoint, 'chain_getBlock');
    const blockHash = await rpcToNode(rpcEndpoint, 'chain_getBlockHash');
    const genesisHash = await rpcToNode(rpcEndpoint, 'chain_getBlockHash', [0]);
    const metadataRpc = await rpcToNode(rpcEndpoint, 'state_getMetadata');
    const { specVersion, transactionVersion } = await rpcToNode(
      rpcEndpoint, 'state_getRuntimeVersion'
    );

    const registry = new TypeRegistry();
    registry.register(getStruct())

    const nonce = parseInt(options["nonce"]);
    const eraPeriod = parseInt(options["eraPeriod"]);
    const from = '5DwQSSQ1HCfLP15sPSLhU3MGdu4gswLHasDsKXRKbiiV1a1c';
    const tip = parseInt(options["tip"]);
    console.log(`log===> tx checkpoint, blockNumber: ${block.header.number}, blockHash: ${blockHash}, eraPeriod: ${eraPeriod}`);
    const diddocs = JSON.parse(did_doc)
    const unsigned = didCreate(
      {
        did: did,
        didDoc: diddocs
      },
      {
        address: from,
        blockHash: eraPeriod <= 0 ? genesisHash : blockHash,
        blockNumber: eraPeriod <= 0 ? 0 : registry
          .createType('BlockNumber', block.header.number)
          .toNumber(),
        eraPeriod: eraPeriod, // txwrapper 内部以 2 的 n 的方式转化该值
        genesisHash,
        metadataRpc,
        nonce: nonce,
        specVersion,
        tip: tip,
        transactionVersion,
      },
      {
        metadataRpc,
        registry,
      }
    );

   
    console.log("log", `======> EXTRINSIC_VERSION: ${EXTRINSIC_VERSION}`);
    const signingPayload = createSigningPayload(unsigned, { registry });
    const extrinsicPayload = registry.createType('ExtrinsicPayload', signingPayload, { version: EXTRINSIC_VERSION });
    const actualPayload = extrinsicPayload.toU8a({  method: true });
    console.log('actualPayload',u8aToHex(actualPayload))
    const alice = keyring.createFromUri(menmeonic);

    // sign 1
    //const { signature } = extrinsicPayload.sign(alice);
    //console.log('signature',signature)

    // sign 2
    const payloadId = blake2AsHex(actualPayload, 256);
    var signature = u8aToHex(alice.sign(payloadId))
    signature = '0x02' + signature.substring(2)

    console.log("signature: ", extrinsicPayload.sign(alice));
    console.log("signature 1: ", signature);

    console.log('payloadId',payloadId)

    const signedTx = createSignedTx(unsigned, signature, { metadataRpc, registry });
    console.log('signedTx', signedTx)

    if (signedTx != undefined) {
      const aa = await rpcToNode(rpcEndpoint, 'author_submitExtrinsic', [signedTx]);
      console.log('aa', aa)
      process.exit(0)

    } else {
      process.exit(0)
    }
  } catch (err) {
    console.log("log==" + err.message)
    process.exit(0)
  }
}

function rpcToNode(rpcEndpoint, method, params) {
  return fetch(rpcEndpoint, {
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
        const msg = `${error.code} ${error.message}: ${JSON.stringify(error.data)}`;
        console.log("error=" + msg);
      }
      return result;
    });
}

async function initApi() {
  const provider = new WsProvider('ws://127.0.0.1:9944');
  provider.on('connected', () => {
    console.log('===> provider has been connected to the endpoint');
  });
  const api = new ApiPromise({ provider: provider, types: getStruct() });
  await api.isReady;
  return api
}

function getStruct() {
  return {
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
}

main().catch(console.error);

