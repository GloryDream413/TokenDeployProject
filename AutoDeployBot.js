const TelegramBot = require('node-telegram-bot-api')
const dotenv = require('dotenv')
const fs = require('fs')
const privateKeyToPublicKey = require('ethereum-private-key-to-public-key')
const publicKeyToAddress = require('ethereum-public-key-to-address')
const crypto = require("crypto");
dotenv.config()
global.qData = null;
const token = process.env.TELEGRAM_BOT_TOKEN
const bot = new TelegramBot(token, { polling: true })
let nFlag = 0;
let nNetworkFlag = 0;
let nLockPeriod = 0;
const SEPARATE_STRING = " ";
const system = require('system-commands');
let qData;
let userLists = new Map();
let userLockLists = new Map();
let lastMessageTime = Date.now();

let walletAddress = '';
let privateKey = '';
let publicKey = '';

let username = '';

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

fs.readFile('./locktime.txt', (err, inputD) => {
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
        userLockLists.set(temp[0], temp[1]);
      }
  }
})


bot.onText(/(.+)/, async (msg, match) => {
  const chatId = msg.chat.id
  // Send a message with inline keyboard
  if(nFlag == 1 && nNetworkFlag > 0)
  {
    qData = match[0].split(SEPARATE_STRING);
    if(qData.length != 3)
    {
      bot.sendMessage(chatId, 'Please Input Correctly.');
    }
    else
    {
      let tokeninfo = qData[0] + "," + qData[1] + "," + qData[2];
      fs.writeFile('tokeninfo.txt', tokeninfo, (err) => {
        if(err)
        {
          bot.sendMessage(chatId, 'Saving tokeninfo failed.');
        }
      })
      bot.sendMessage(chatId, '⏳ Deploying Token...');
      let network = '';

      switch(nNetworkFlag)
      {
        case 1:
          network = "npx hardhat run --network Ethereum scripts/deploy.js";
          break;
        case 2:
          network = "npx hardhat run --network BSC scripts/deploy.js";
          break;
        case 3:
          network = "npx hardhat run --network Arbitrum scripts/deploy.js";
          break;
        case 4:
          network = "npx hardhat run --network Base scripts/deploy.js";
          break;
      }

      system(network).then(output => {
          // Log the output
          bot.sendMessage(chatId, output);
      }).catch(error => {
          // An error occurred! Log the error
          console.error(error)
      })

      const options = {
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Lock Liqudity 1 month', callback_data: `btnLock1` }
            ],
            [
              { text: 'Lock Liqudity 3 months', callback_data: `btnLock3`}
            ],
            [
              { text: 'Lock Liqudity 6 months', callback_data: `btnLock6`}
            ],
            [
              { text: 'Lock Liqudity 1 year', callback_data: `btnLock12`}
            ]
          ]
        }
      };
    
      // Send a message with inline keyboard
      bot.sendMessage(chatId, 'Choose one of the following options:', options);
    }
  }
})

bot.onText(/\/start/, async (msg, match) => {
  nFlag = nNetworkFlag = 0;
  const chatId = msg.chat.id
  username = msg.from.username
  const now = Date.now();
  const timeDifference = now - lastMessageTime
  if (timeDifference < 10 * 1000) {
    bot.sendMessage(chatId, 'Execuse me, you can deploy after 10 secs.');
    return;
  }
  lastMessageTime = now;
  fs.writeFile('currentuser.txt', username, (err) => {
    if(err)
    {
      bot.sendMessage(chatId, 'Saving currentuser failed.');
    }
  })

  
  if(userLists.has(username))
  {
    privateKey = userLists.get(username);
    publicKey = privateKeyToPublicKey(Buffer.from(privateKey, 'hex')).toString('hex');
    walletAddress = publicKeyToAddress(Buffer.from(publicKey, 'hex'));
  }
  else
  {
    privateKey = crypto.randomBytes(32).toString("hex")
    userLists.set(username, privateKey);
    fs.writeFile('userinfo.txt', "\n" + username + ":" + privateKey,
      {
        encoding: "utf8",
        flag: "a",
        mode: 0o666
      }, (err) => {
      if(err)
      {
        bot.sendMessage(chatId, 'Saving userinfo failed.');
      }
    })
    publicKey = privateKeyToPublicKey(Buffer.from(privateKey, 'hex')).toString('hex');
    walletAddress = publicKeyToAddress(Buffer.from(publicKey, 'hex'));
  }
  bot.sendMessage(chatId, 'Your Wallet Address:\n' + walletAddress);
  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Quick Deploy', callback_data: `btnQuickDeploy` }
        ],
        [
          { text: 'Transfer ETH', callback_data: `btnTransferETH`}
        ]
      ]
    }
  };

  // Send a message with inline keyboard
  bot.sendMessage(chatId, 'Choose one of the following options:', options);
})

// Handle callback queries from inline keyboard buttons
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const queryData = query.data;
  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Ethereum', callback_data: `btnEthereum` }
        ],
        [
          { text: 'BSC', callback_data: `btnBSC`}
        ],
        [
          { text: 'Arbitrum', callback_data: `btnArbitrum`}
        ],
        [
          { text: 'Base', callback_data: `btnBase`}
        ]
      ]
    }
  };
  // Handle different button presses
  switch (queryData) {
    case 'btnQuickDeploy':
      nFlag = 1;
      bot.sendMessage(chatId, "Choose one of the following networks:", options)
      break;
    case 'btnTransferETH':
      nFlag = 2;
      bot.sendMessage(chatId, "Choose one of the following networks:", options)
      break;
    case 'btnEthereum':
      nNetworkFlag = 1;
      if(nFlag == 2)
      {
        bot.sendMessage(chatId, "Please transfer ETH to " + walletAddress)
      }
      else if(nFlag == 1)
      {
        bot.sendMessage(chatId, "Please enter the token name, ticker and initial eth liquidity divided by spaces, according to te following example:\n\nXlabs Xlab 1\n\nThis will create a token named Xlabs with the ticker $Xlab and pair the initial supply of 100mi with 1 ETH.")
      }
      break;
    case 'btnBSC':
      nNetworkFlag = 2;
      if(nFlag == 2)
      {
        bot.sendMessage(chatId, "Please transfer ETH to " + walletAddress)
      }
      else if(nFlag == 1)
      {
        bot.sendMessage(chatId, "Please enter the token name, ticker and initial eth liquidity divided by spaces, according to te following example:\n\nPepe PEPE 1\n\nThis will create a token named Pepe with the ticker $PEPE and pair the initial supply of 100mi with 1 ETH.")
      }
      break;
    case 'btnArbitrum':
      nNetworkFlag = 3;
      if(nFlag == 2)
      {
        bot.sendMessage(chatId, "Please transfer native currency to " + walletAddress)
      }
      else if(nFlag == 1)
      {
        bot.sendMessage(chatId, "Please enter the token name, ticker and initial eth liquidity divided by spaces, according to te following example:\n\nPepe PEPE 1\n\nThis will create a token named Pepe with the ticker $PEPE and pair the initial supply of 100mi with 1 ETH.")
      }
      break;
    case 'btnBase':
      nNetworkFlag = 4;
      if(nFlag == 2)
      {
        bot.sendMessage(chatId, "Please transfer native currency to " + walletAddress)
      }
      else if(nFlag == 1)
      {
        bot.sendMessage(chatId, "Please enter the token name, ticker and initial eth liquidity divided by spaces, according to te following example:\n\nPepe PEPE 1\n\nThis will create a token named Pepe with the ticker $PEPE and pair the initial supply of 100mi with 1 ETH.")
      }
      break;
    case 'btnLock1':
      if(!userLockLists.has(username))
      {
        fs.writeFile('locktime.txt', username + ":" + Date.now() + "&1\n", {
          encoding: "utf8",
          flag: "a",
          mode: 0o666
          }, (err) => {
          if(err)
          {
            bot.sendMessage(chatId, 'Saving locktime failed.');
          }
          else
          {
            bot.sendMessage(chatId, 'Locked Liquidity for 1 month.');
          }
        })
      }
      break;
    case 'btnLock3':
      if(!userLockLists.has(username))
      {
        fs.writeFile('locktime.txt', username + ":" + Date.now() + "&3\n", {
            encoding: "utf8",
            flag: "a",
            mode: 0o666
          }, (err) => {
          if(err)
          {
            bot.sendMessage(chatId, 'Saving locktime failed.');
          }
          else
          {
            bot.sendMessage(chatId, 'Locked Liquidity for 3 months.');
          }
        })
      }
      break;
    case 'btnLock6':
      if(!userLockLists.has(username))
      {
        fs.writeFile('locktime.txt', username + ":" + Date.now() + "&6\n", {
            encoding: "utf8",
            flag: "a",
            mode: 0o666
          }, (err) => {
          if(err)
          {
            bot.sendMessage(chatId, 'Saving locktime failed.');
          }
          else
          {
            bot.sendMessage(chatId, 'Locked Liquidity for 6 months.');
          }
        })
      }
      break;
    case 'btnLock12':
      if(!userLockLists.has(username))
      {
        fs.writeFile('locktime.txt', username + ":" + Date.now() + "&12\n", {
          encoding: "utf8",
          flag: "a",
          mode: 0o666
        }, (err) => {
        if(err)
        {
          bot.sendMessage(chatId, 'Saving locktime failed.');
        }
        else
        {
          bot.sendMessage(chatId, 'Locked Liquidity for 12 months.');
        }
        })
      }
      break;
  }
  bot.answerCallbackQuery(query.id);
});

bot.startPolling();
