/* eslint-disable header/header */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/unbound-method */

// Import the API
const { ApiPromise, WsProvider } = require('@polkadot/api');
const utf8 = require('utf8');

async function main() {
    let a = [2, 4, 3, 8, 4, 2, 3]
    var result = a[0]
    for (var i = 1; i < a.length; i++) {
        result = result ^ a[i]
    }

    let aa = 'did:ccp:3A9BsPiXPJC23n9YqXApxadQof4fhqe기술 교사#key-1'
    /*  console.log(utf8.encode(aa))
     console.log(utf8.decode(utf8.encode(aa)))
     console.log(hex2a("0xakuhfsddsvg")) */

    let c = { a: 'fjjdskh', b: true, c: "kldsjdn" }

    console.log(JSON.stringify(c))



    let d ='{"a":"fjjdskh","b":true,"c":"kldsjdn"}'
    console.log(JSON.parse(d))

    let key = '0x35486d5464376e52535546586e66515932617a615739424d4c5a45525669457a4279617a583448656977555358616267'
    console.log(hex2a(key))
     let key1 = '0x354838386b6a646458654a516e336a57447a454a4e69326b6977744a516356787a757163634c6864776e316648633539'
    console.log(hex2a(key1))

    process.exit(0)
}

function encode_utf8(s) {
    let tmp = encodeURIComponent(s);
    let tmp2 = unescape(tmp);
    return tmp2;
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

function byteToString(arr) {
    if (typeof arr === 'string') {
        return arr;
    }
    var str = '',
        _arr = arr;
    for (var i = 0; i < _arr.length; i++) {
        var one = _arr[i].toString(2),
            v = one.match(/^1+?(?=0)/);
        if (v && one.length == 8) {
            var bytesLength = v[0].length;
            var store = _arr[i].toString(2).slice(7 - bytesLength);
            for (var st = 1; st < bytesLength; st++) {
                store += _arr[st + i].toString(2).slice(2);
            }
            str += String.fromCharCode(parseInt(store, 2));
            i += bytesLength - 1;
        } else {
            str += String.fromCharCode(_arr[i]);
        }
    }
    return str;
}



// 传入参数先转换为utf8 byte数组
function stringToByte(str) {
    var bytes = new Array();
    var len, c;
    len = str.length;
    for (var i = 0; i < len; i++) {
        c = str.charCodeAt(i);
        if (c >= 0x010000 && c <= 0x10FFFF) {
            bytes.push(((c >> 18) & 0x07) | 0xF0);
            bytes.push(((c >> 12) & 0x3F) | 0x80);
            bytes.push(((c >> 6) & 0x3F) | 0x80);
            bytes.push((c & 0x3F) | 0x80);
        } else if (c >= 0x000800 && c <= 0x00FFFF) {
            bytes.push(((c >> 12) & 0x0F) | 0xE0);
            bytes.push(((c >> 6) & 0x3F) | 0x80);
            bytes.push((c & 0x3F) | 0x80);
        } else if (c >= 0x000080 && c <= 0x0007FF) {
            bytes.push(((c >> 6) & 0x1F) | 0xC0);
            bytes.push((c & 0x3F) | 0x80);
        } else {
            bytes.push(c & 0xFF);
        }
    }
    return bytes;
}

main().catch(console.error);