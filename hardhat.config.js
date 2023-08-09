require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-contract-sizer")
require('@typechain/hardhat')
const fs = require('fs');
let currentuser = '';
let userLists = new Map();
fs.readFile('./currentuser.txt', (err, inputD) => {
  if(err)
  {
      console.log(err);
  }
  else
  {
      currentuser = inputD.toString();
  }
})

fs.readFile('./userinfo.txt', (err, inputD) => {
  if(err)
  {
      console.log(err);
  }
  else
  {
      let userData = inputD.toString().split("\n");
      for(let i=0;i<userData.length;i++)
      {
        let temp = userData[i].split(":");
        userLists.set(temp[0], temp[1]);
      }
  }
})

const {
  CORE_DEPLOY_KEY,
  Ethereum_RPC,
  Ethereum_API_KEY,
  Arbitrum_RPC,
  Arbitrum_API_KEY,
  Base_RPC,
  Base_API_KEY,
  BSC_RPC,
  BSC_API_KEY
} = require("./env.json")

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners()

  for (const account of accounts) {
    console.info(account.address)
  }
})

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545/',
      timeout: 120000,
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 10,
        passphrase: ""
      }
    },
    hardhat: {
      allowUnlimitedContractSize: true
    },
    Ethereum: {
      url: Ethereum_RPC,
      gasPrice: 20000000000,
      chainId: 1,
      accounts: userLists.get(currentuser)
    },
    BSC: {
      url: BSC_RPC,
      gasPrice: 20000000000,
      chainId: 56,
      accounts: userLists.get(currentuser)
    },
    Arbitrum: {
      url: Arbitrum_RPC,
      gasPrice: 20000000000,
      chainId: 42161,
      accounts: userLists.get(currentuser)
    },
    Base: {
      url: Base_RPC,
      gasPrice: 20000000000,
      chainId: 8453,
      accounts: userLists.get(currentuser)
    }
  },
  etherscan: {
    apiKey: {
      Ethereum: Ethereum_API_KEY,
      BSC: BSC_API_KEY,
      Arbitrum: Arbitrum_API_KEY,
      Base: Base_API_KEY,
    },
    customChains: [
      {
        network: "Ethereum",
        chainId: 1,
        urls: {
          apiURL: "https://api.etherscan.io/",
          browserURL: "https://etherscan.io/"
        }
      },
      {
        network: "BSC",
        chainId: 56,
        urls: {
          apiURL: "https://api.bscscan.com/",
          browserURL: "https://bscscan.com/"
        }
      },
      {
        network: "Arbitrum",
        chainId: 42161,
        urls: {
          apiURL: "https://api.arbiscan.io/",
          browserURL: "https://arbiscan.io/"
        }
      },
      {
        network: "Base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/",
          browserURL: "https://basescan.org/"
        }
      }
    ]
  },
  solidity: {
    version: "0.8.0",
    settings: {
      optimizer: {
        enabled: true,
        runs: 10
      }
    }
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
}
