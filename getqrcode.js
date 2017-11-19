//var ec=require('everycoin') //dependency
var qrcode = require('qrcode-terminal') //dependency
var readline=require('readline')
var rl=readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.question('Enter uri (scheme:address): ', uriEntered)

function uriEntered(uri) {
  for (var count=0; count<50; count++) {
    console.log()
  }
  console.log(uri)
  qrcode.generate(uri);
  console.log(uri)
  setImmediate(process.exit)
}
