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



async function createUnsignedTxPayload(api, blockHash) {
  console.log(api.rpc);
  let b = await api.rpc.chain.getBlock(blockHash);
  console.log(b);
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

async function main() {
  const api = await initApi()

  const [chain, nodeName, nodeVersion] = await Promise.all([
    api.rpc.system.chain(),
    api.rpc.system.name(),
    api.rpc.system.version()
  ]);

  console.log(`You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`);

 // console.log(api.rpc);

  // const hash = '0xb006e31be7cc41c2b40ac1b326e054470e9391186da8bf595fde0af8ee359390'
  //  createUnsignedTxPayload(api, hash)
}


main().catch((error) => {
  console.error(error);
  process.exit();
});

