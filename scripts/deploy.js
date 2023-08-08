const hre = require("hardhat");
const { deploy_core } = require('./networks/core')
const { setNetwork } = require("../shared/syncParams")

async function main() {
  setNetwork(hre.network.name)
  if (hre.network.name === "hardhat" || hre.network.name === "localhost") {
    await deploy_localhost()
  } else if (hre.network.name === "core") {
    await deploy_core()
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});