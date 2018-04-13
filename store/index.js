const series = require('async/series')
const IPFS = require('ipfs')
const fs = require("fs")
const log = require('log-to-file')
const Web3 = require('web3')
var util = require('ethereumjs-util');
var tx = require('ethereumjs-tx');
var lightwallet = require('eth-lightwallet');
var txutils = lightwallet.txutils;

const node = new IPFS({ repo: 'BDNStore' })
let fileMultihash
var bufferData
var web3
var abi

var contractAddress = '0x7fCFe62A3Ff36ede44ACaBcA2F6CF9e6c0223D0c'

var address = '0x82dFE5f3d93306b5eA21b76231f426D045Dff66e';
var key = '20ef1ed5db9ba301dfddf373208f9b457f06bf7613c0760176650e820462ecfc';

var arguments = process.argv.splice(2);
var path = arguments[0];

abi = JSON.parse('[ { "constant": true, "inputs": [ { "name": "_dataId", "type": "uint256" } ], "name": "getData", "outputs": [ { "name": "", "type": "uint256", "value": "0" }, { "name": "", "type": "uint256", "value": "0" }, { "name": "", "type": "address", "value": "0x0000000000000000000000000000000000000000" }, { "name": "", "type": "string", "value": "" }, { "name": "", "type": "string", "value": "" }, { "name": "", "type": "uint256", "value": "0" }, { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "dataIndex", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_uuid", "type": "uint256" }, { "name": "_ueid", "type": "address" }, { "name": "_dataType", "type": "string" }, { "name": "_filePath", "type": "string" }, { "name": "_totalCount", "type": "uint256" }, { "name": "_createTime", "type": "uint256" } ], "name": "addDataToStore", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" } ]')
web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/"));

fs.readFile(path, function (err, data) {
    if (err) throw err;
    bufferData = data
});

series([
  (cb) => node.on('ready', cb),
  (cb) => node.files.add({
    content: Buffer.from(bufferData)
  }, (err, filesAdded) => {
    if (err) {
        log(err, 'errors.log')
        setTimeout(function() {
            process.exit(1);
        }, 1000*10);
    }
    fileMultihash = filesAdded[0].hash
    log('Data saved, hash '+ fileMultihash, 'store.log')
    try {
        var txOptions = {
            nonce: web3.toHex(web3.eth.getTransactionCount(address)),
		    gasLimit: web3.toHex(800000),
		    gasPrice: web3.toHex(2000000),
            to: contractAddress
        }
        var uid = 1;
        var dataType = 'mac'
        var lines = bufferData.toString().split("\n").length
        var dataArr = [uid,address,dataType,fileMultihash,lines,Date.now()]
        var rawTx = txutils.functionTx(abi, 'addDataToStore', dataArr, txOptions);
        sendRaw(rawTx);
    } catch (err) {
        log(err, 'errors.log')
        setTimeout(function() {
            process.exit(1);
        }, 1000*10);
    }
    cb()
  })
])

function sendRaw(rawTx) {
    var privateKey = new Buffer(key, 'hex');
    var transaction = new tx(rawTx);
    transaction.sign(privateKey);
    var serializedTx = transaction.serialize().toString('hex');
    web3.eth.sendRawTransaction(
    '0x' + serializedTx, function(err, result) {
        if(err) {
            log(err, 'errors.log')
            setTimeout(function() {
                process.exit(1);
            }, 1000*10);
        } else {
            log('Result '+ result, 'store.log')
            setTimeout(function() {
                process.exit(0);
            }, 1000*5);
        }
    });
}
