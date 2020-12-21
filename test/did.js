const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/keyring');

// Some constants we are using in this sample
const ALICE = '5DFxhnHDBdYnPPRa2vUBBLHRpdmT5jLfTJKNQdwyPAK83fwE';
const menmeonic = 'gossip master mandate chunk blouse hammer venue inside jungle social dinner latin';
const utf8 = require('utf8');

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

    didCreate(api, pair, nonce)
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

function didCreate(api, pair, nonce) {
    let did = "did:ccp:3A9BsPiXPJC23n9YqXApxadQof4fhqe"
    api.tx.identitymeModule
        .didCreate(did, getDidDoc(did))
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


function getDidDoc(did) {
    let d = encode_utf8(did + "기술 교사#key-1")
    let e = stringToByte(did + "기술 교사#key-1")
 console.log(e.toString())
    
    let keys = [
        {
            id: d, encrypt_type: "Secp256k1", publicKeyHex: ALICE
        },
        {
            id: e, encrypt_type: "2135450x624234526", publicKeyHex: ALICE
        }
    ]
    let service = [{
        id: "did:ccp:3A9BsPiXPJCn9YqXApxaQof4fhqe#resolver", encrypt_type: "Secp256k1", serviceEndpoint: "https://did.baidu.com"
    }]
    let proof = [{
        encrypt_type: "Secp256k1",
        signatureValue: "30450221008e75a5230ee14c2DSe9b975c7e720cece6d43ce6bd8f330afc76b200af96fb714663cec49e",
        creator: did + "#key-1"
    }]
    return {
        context: escape("https://w3id.org/did/v1"),
        id: did,
        version: 1,
        created: "2020-10-30T09:26:03.283Z",
        updated: "2020-10-30T09:26:03.283Z",
        publicKey: keys,
        authentication: did + "#key-1",
        recovery: did + "#key-2",
        service: service,
        proof: proof
    }
}

var dec2utf8 = function (arr) {
    if (typeof arr === 'string') {
        return arr;
    }

    var unicodeString = '', _arr = arr;
    for (var i = 0; i < _arr.length; i++) {
        var one = _arr[i].toString(2);
        var v = one.match(/^1+?(?=0)/);

        if (v && one.length === 8) {
            var bytesLength = v[0].length;
            var store = _arr[i].toString(2).slice(7 - bytesLength);

            for (var st = 1; st < bytesLength; st++) {
                store += _arr[st + i].toString(2).slice(2)
            }

            unicodeString += String.fromCharCode(parseInt(store, 2));
            i += bytesLength - 1;
        } else {
            unicodeString += String.fromCharCode(_arr[i]);
        }
    }
    return unicodeString
};

function encode_utf8(s) {
    return unescape(encodeURIComponent(s));
  }
  
  function decode_utf8(s) {
    return decodeURIComponent(escape(s));
  }

function hex2a(hex) {
    var hex = hex.toString();
    var str_list = [];
    for (var i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
        str_list.push(parseInt(hex.substr(i, 2), 16));
    return dec2utf8(str_list);
}

function str2utf8(str) {
    return decodeURI(str);
}

function stringToByte(str) {
    var bytes = new Array();
    var len, c;
    len = str.length;
    for(var i = 0; i < len; i++) {
        c = str.charCodeAt(i);
        if(c >= 0x010000 && c <= 0x10FFFF) {
            bytes.push(((c >> 18) & 0x07) | 0xF0);
            bytes.push(((c >> 12) & 0x3F) | 0x80);
            bytes.push(((c >> 6) & 0x3F) | 0x80);
            bytes.push((c & 0x3F) | 0x80);
        } else if(c >= 0x000800 && c <= 0x00FFFF) {
            bytes.push(((c >> 12) & 0x0F) | 0xE0);
            bytes.push(((c >> 6) & 0x3F) | 0x80);
            bytes.push((c & 0x3F) | 0x80);
        } else if(c >= 0x000080 && c <= 0x0007FF) {
            bytes.push(((c >> 6) & 0x1F) | 0xC0);
            bytes.push((c & 0x3F) | 0x80);
        } else {
            bytes.push(c & 0xFF);
        }
    }
    return bytes;
}

main().catch(console.error);
