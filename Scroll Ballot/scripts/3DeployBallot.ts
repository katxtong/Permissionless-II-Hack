import { ethers } from "ethers";
import { TokenizedBallot__factory } from '../typechain-types';  //Note: Change this to the solidity file (i.e fileName__factory) you have compiled
import * as dotenv from 'dotenv';
dotenv.config();

function setupProvider() {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_END_POINT ?? "");
    return provider;
}

async function main() {

    const provider = setupProvider()
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);

    console.log("Deploying contract...");

    // Define the constructor arguments for your TokenizedBallot contract
    const PROPOSALS = ["squirtle", "charmander", "bulbasaur"] // hardcoded to test
    // const PROPOSALS = process.argv.slice(3);
    const proposalBytes32String = PROPOSALS.map(ethers.encodeBytes32String)
    const tokenContract = process.env.VOTING_TOKEN_ADDRESS ?? "";
    console.log(tokenContract);
    const blockNumber = 624612; // hardcoded to test
    // const blockNumber = process.argv[2];
    // console.log("Current block number:", blockNumber);
    // console.log("Proposals: ");
    // PROPOSALS.forEach((element, index) => {
    //     console.log(`\tProposal No. ${index + 1}: ${element}`);
    // });

    // Deployment
    const balanceBN = await provider.getBalance(wallet.address);
    const balance = Number(ethers.formatUnits(balanceBN));
    console.log(`\nWallet balance ${balance}.`);
    if (balance < 0.01) {
        throw new Error("Not enough ether.");
    }

    const ballotFactory = new TokenizedBallot__factory(wallet);
    const ballotContract = await ballotFactory.deploy(
        proposalBytes32String, tokenContract, blockNumber
    );

    await ballotContract.waitForDeployment();
    const address = await ballotContract.getAddress();

    console.log(`Deployed contract at ${address}`);
    console.log(`Wallet balance ${balance}.`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

// ballot deployed address: 0x5bE3B4094ebE917af96e699237cb03bc03ad2ca2
