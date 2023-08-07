const deployLpToken = require("../deployLpToken.js");
const deploy_core = async () => {
    await deployLpToken()
}

module.exports = { deploy_core };