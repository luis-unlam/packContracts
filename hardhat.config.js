const dotenv = require('dotenv');
const IS_SCRIPT = process.env.npm_lifecycle_script?.startsWith('hardhat "run"');

console.table({ IS_SCRIPT });

let NETWORK;
let networks;
if (IS_SCRIPT) {
  NETWORK = process.env.NETWORK;
  dotenv.config({ path: '.env.local' });
  const ENVIRONMENT_TO_DEPLOY = process.env.ENVIRONMENT_TO_DEPLOY;
  console.table({ ENVIRONMENT_TO_DEPLOY });
  dotenv.config({ path: `.env.${ENVIRONMENT_TO_DEPLOY}` });
  networks = {
    rinkeby: {
      chainId: 4,
      url: `https://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [`${process.env.WALLET_PRIVATE_KEY}`],
      gas: 'auto',
      gasPrice: 'auto',
    },
    eth: {
      chainId: 1,
      url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [`${process.env.WALLET_PRIVATE_KEY}`],
      gas: 'auto',
      gasPrice: 'auto',
    },
  };
}
console.table({ NETWORK });

require('@nomiclabs/hardhat-waffle');
require('@openzeppelin/hardhat-upgrades');
require('hardhat-contract-sizer');
require('hardhat-gas-reporter');
require('solidity-coverage');

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});

const SIGNER_DOMAIN_NAME = 'NFTClaimedAmount'; //This value must be equals that in contract
const SIGNER_DOMAIN_VERSION = '1'; //This value must be equals that in contract

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  outputData: './output',
  solidity: {
    version: '0.8.9',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  gasReporter: {
    currency: 'USD',
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  contractsAddresses: {
    minter: process.env.MINTER_ADDRESS,
    collection: process.env.COLLECTION_ADDRESS,
  },
  deploySettings: {
    royaltySettings: {
      address: process.env.ROYALTY_ADDRESS,
      percentage: Number(process.env.ROYALTY_PERCENTAGE),
    },
    signerSettings: {
      domainName: SIGNER_DOMAIN_NAME,
      domainVersion: SIGNER_DOMAIN_VERSION,
    },
    chainlinkSettings: {
      subscriptionId: Number(process.env.CHAINLINK_SUBS_ID),
      coordinator: process.env.CHAINLINK_COORDINATOR_ADDRESS,
      keyHash: process.env.CHAINLINK_KEY_HASH, //This determine max gas price
    },
    villainsSettings: {
      baseUri: `${process.env.MORALIS_SERVER_URL}/functions/getMetadata?tokenId=`,
      description: 'Collection Description',
    },
  },
  moralisSettings: {
    moralisSecret: process.env.MORALIS_SECRET,
    serverUrl: process.env.MORALIS_SERVER_URL,
    appId: process.env.MORALIS_APP_ID,
    masterKey: process.env.MORALIS_MASTER_KEY,
    delayRate: 500, //in miliseconds
    pageSize: 100,
    queryLimit: 15000,
  },
  stages: {
    giveaway: {
      name: 'giveaway',
      price: '0',
      maxAmount: 100,
      useWhitelist: true, //esto habilita el uso del merkle root en el contrato
      whitelistFilePath: 'scripts/data/custom-whitelist.csv', //custom addresses to add to whitelist
    },
    presale: {
      name: 'presale',
      price: '0.01',
      maxAmount: 2,
      useWhitelist: true,
      whitelistFilePath: 'scripts/data/custom-whitelist.csv', //custom addresses to add to whitelist
    },
    opensale: {
      name: 'opensale',
      price: '0.02',
      maxAmount: 2,
      useWhitelist: false,
    },
  },
  defaultNetwork: NETWORK,
  networks,
  paths: {
    //tests: './tests',
    tests: './contracts/common/tests',
  },
  mocha: {
    timeout: 200000,
  },
};
