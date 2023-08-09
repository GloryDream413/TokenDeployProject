const { deployContract } = require("../shared/helpers");
const fs = require('fs');

async function deployToken() {
    let tokenName, tokenTicker, lpAmount;
    fs.readFile('./tokeninfo.txt', (err, inputD) => {
        if(err)
        {
            console.log(err);
        }
        else
        {
            let tokenInfo = inputD.toString().split(",");
            tokenName = tokenInfo[0];
            tokenTicker = tokenInfo[1];
            lpAmount = tokenInfo[2];
            deployContract("Token", [tokenName, tokenTicker, lpAmount])
        }
    })
}
module.exports = deployToken