const deployToken = require("../deployToken.js");
const deploy_core = async () => {
    await deployToken()
}

module.exports = { deploy_core };