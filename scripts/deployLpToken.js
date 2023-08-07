const { deployContract, verifyContract } = require("../shared/helpers");
const { getDeployFilteredInfo, getNetwork } = require("../shared/syncParams");

const depositFee = 30;

async function deployLpToken() {
    await deployContract("LpToken", ["Fama", "Fama"])
}

module.exports = deployLpToken