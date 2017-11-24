var ec=require('everycoin') //dependency
var crypto = require('crypto')
var qrcode = require('qrcode-terminal') //dependency
var bip39 = require('bip39') //dependency
var base58=require('bs58')
var readline=require('readline')
var rl=readline.createInterface({
  input: process.stdin,
  output: process.stdout
})
var compressed=true

function Keypair() {
}

Keypair.prototype.setEntropy = function(e) {
  this.entropy=e
  this.basemnemonic=bip39.entropyToMnemonic(this.entropy)
}

Keypair.prototype.setMnemonic = function(m) {
  var coin=process.argv[2]
  var hash=crypto.createHash('sha256')
  hash.update(m)
  this.mnemonic=m
  this.sha256=hash.digest()
  this.pubk_compressed=ec.getpublickey(this.sha256, true)
  this.address=ec.getaddress(this.pubk_compressed, coin)
}

Keypair.prototype.generateEntropy = function() {
  this.setEntropy(crypto.randomBytes(16).toString('hex'))
}

Keypair.prototype.incrementEntropy = function() {
  var buf=new Buffer(this.entropy, 'hex')
  for (var i=0; i<buf.length; i++) {
    if (buf[i]++ !== 255) break
  }
  this.setEntropy(buf.toString('hex'))
}

Keypair.prototype.getBaseMnemonic = function() {
  return this.basemnemonic
}

Keypair.prototype.getMnemonic = function() {
  return this.mnemonic
}

Keypair.prototype.getSHA256 = function() {
  return this.sha256
}

Keypair.prototype.getAddress = function() {
  return this.address
}

main()

function main() {
  var coin=process.argv[2]
  var version=ec.getversion(coin)
  if (typeof version === 'undefined') {
    console.log("usage: node vanitygen.js coin [start]")
    process.exit()
  }
  rl.question('Please enter a salt (e.g. name, email address): ', generate_keypair)
}

function addressMatches(keypair) {
  var start=process.argv[3]
  console.log(start)
  if (typeof start==='undefined') {
    return true
  }
  return (keypair.getAddress().startsWith(start))
}

function checkMnemonic(keypair, salt) {
  var mnemonic = keypair.getBaseMnemonic()
  console.log(mnemonic)
  mnemonic='SHA256 SPACE '+salt+' WL39E CK39 '+mnemonic
  keypair.setMnemonic(mnemonic)
  if (addressMatches(keypair)) {
    keypairFound(keypair)
    return
  }
  keypair.incrementEntropy()
  setImmediate(checkMnemonic, keypair, salt)
}

function generate_keypair(salt) {
  console.log('Generating keypair...')
  var found=0
  var keypair=new Keypair
  keypair.generateEntropy()
  checkMnemonic(keypair, salt)
}

function keypairFound(keypair) {
  var coin=process.argv[2]
  var privk=keypair.getSHA256()
  var wif=ec.getwif(privk, coin, compressed)
  var address=keypair.getAddress()
  console.log()
  console.log()
  console.log('mnemonic:',keypair.getMnemonic())
  console.log()
  console.log(privk.toString('hex'))
  console.log(wif, address)
  rl.question('Copy the mnemonic down and then hit enter (will clear screen):', clear_and_display_qrcode.bind(this, keypair))
}

function clear_and_display_qrcode(keypair, ignore) {
  var address=keypair.getAddress()
  for (var count=0; count<50; count++) {
    console.log()
  }
  console.log(address)
  //qrcode.generate('litecoin:'+address);
  qrcode.generate(address);
  console.log(address)
  setImmediate(process.exit)
}
