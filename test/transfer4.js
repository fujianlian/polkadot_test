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


const { ApiPromise, WsProvider } = require('@polkadot/api');
const { stringToU8a, u8aToHex, hexToU8a } = require('@polkadot/util');
const { EXTRINSIC_VERSION } = require('@polkadot/types/extrinsic/v4/Extrinsic');

// 存储构造交易的临时数据，用于签名和序列化交易多处使用
let extrinsicContainer = {};
const { Keyring } = require('@polkadot/keyring');
const fetch = require("node-fetch");
const keyring = new Keyring({ ss58Format: 2, type: 'ecdsa' });
// Some constants we are using in this sample
var ALICE = '';
const from = '5DwQSSQ1HCfLP15sPSLhU3MGdu4gswLHasDsKXRKbiiV1a1c';
//const from = '5DQ22recSK5WPfoaHA7LDCgMTDQZ59wvomLyvctxzMSySF6Y';

const to = '5DDADi9EppQzofb8qvfXku4pBJibC8hkNmwQNEDXkDbJrRrr';
const AMOUNT = 1000000;// / 10^12;

const menmeonic = 'pink shy decide hurdle gift embrace skull tennis desert control change call';
//const menmeonic = 'crime fiction caught appear margin popular broccoli mirror meadow drink naive portion';

async function main() {
  const api = await initApi()
  //getAddress("0x03d596ac5e401c718889bff0fc827fd53774e28e7668e8100da88cb6273636d8d1",42,'ecdsa')
   createUnsignedTxPayload(api, from, to, AMOUNT)
}

async function getAddress(publicKey, ss58Format, keyType) {
  await cryptoWaitReady();
  try {
      if (keyType === 'ecdsa' && publicKey.length > 32) {
          publicKey = blake2AsU8a(publicKey, 256);
      }
      console.log(keyring.encodeAddress(publicKey, ss58Format))
      console.log(keyring.encodeAddress(publicKey, 0))
      console.log(keyring.encodeAddress(publicKey, 1))
  } catch (err) {
      console.log("log", err.message)
      console.log("error", err.message);
      return null;
    
  }
  process.exit(0)
}

async function createUnsignedTxPayload(api, from, to, value) {
  const { nonce } = await api.query.system.account(from);
  console.log(nonce.toString())
  const options = { tip: 0, eraPeriod: 64, nonce: 0 } // TIP: nonce
  const rpcEndpoint = 'http://10.200.79.72:10030'
  console.log(options)
  try {

    const { block } = await rpcToNode(rpcEndpoint, 'chain_getBlock');
    const blockHash = await rpcToNode(rpcEndpoint, 'chain_getBlockHash');
    const genesisHash = await rpcToNode(rpcEndpoint, 'chain_getBlockHash', [0]);
    const metadataRpc = await rpcToNode(rpcEndpoint, 'state_getMetadata');
    const { specVersion, transactionVersion } = await rpcToNode(
      rpcEndpoint, 'state_getRuntimeVersion'
    );
    const registry = getRegistry('Westend', 'westend', specVersion);

    console.log("log", `===> tx checkpoint, blockNumber: ${block.header.number}, blockHash: ${blockHash}, eraPeriod: ${options.eraPeriod}`);
    const unsigned = methods.balances.transfer(
      {
        value: value,
        dest: to,
      },
      {
        address: from,
        blockHash: options.eraPeriod <= 0 ? genesisHash : blockHash,
        blockNumber: options.eraPeriod <= 0 ? 0 : registry
          .createType('BlockNumber', block.header.number)
          .toNumber(),
        eraPeriod: options.eraPeriod, // txwrapper 内部以 2 的 n 的方式转化该值
        genesisHash,
        metadataRpc,
        nonce: options.nonce,
        specVersion,
        tip: options.tip,
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
    const { signature } = extrinsicPayload.sign(alice);
    console.log('signature',signature)

    // sign 2
    const payloadId = blake2AsHex(actualPayload, 256);
    
    console.log("signature 1: ", u8aToHex(alice.sign(actualPayload)));

    console.log('payloadId',payloadId)
    const signedTx = createSignedTx(unsigned, signature, { metadataRpc, registry });
    console.log("signedTx", signedTx)
 
    if (signedTx != undefined) {
      const aa = await rpcToNode(rpcEndpoint, 'author_submitExtrinsic', [signedTx]);
      console.log('aa', aa)
      process.exit(0)
    } else {
      process.exit(0)
    }
  } catch (err) {
    console.log("log", err.message)
    process.exit(0)
  }
}

async function sign(payloadId) {
  const alice = keyring.createFromUri(menmeonic);
  const message = hexToU8a(payloadId)
  const signature = await alice.sign(message);
  return "0x01" + u8aToHex(signature).substring(2)
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
  const provider = new WsProvider('wss://westend-rpc.polkadot.io');
  provider.on('connected', () => {
    console.log('===> provider has been connected to the endpoint');
  });
  const api = new ApiPromise({ provider: provider });
  await api.isReady;
  return api
}


main().catch(console.error);

