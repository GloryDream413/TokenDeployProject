const { deployContract } = require("../shared/helpers");
async function deployToken() {
    await deployContract("Token", ["Fama", "Fama"])
}
module.exports = deployToken