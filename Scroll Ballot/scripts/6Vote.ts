import { ethers } from "ethers";
import * as dotenv from 'dotenv';
import * as BallotJSON from "../artifacts/contracts/TokenizedBallot.sol/TokenizedBallot.json"
dotenv.config();

function setupProvider() {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_END_POINT ?? "");
    return provider;
}

async function main() {

    const provider = setupProvider()
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider)
    const TokenContractAddress = process.env.BALLOT_ADDRESS ?? "";
    console.log("Current address:", wallet.address)

    // proposal index is the first argument in the command line 
    const proposal_id = process.argv[2];
    // the voting power to spend is the second argument in the command line 
    const amount = Number(process.argv[3])

    if (amount < 0) {
        throw new Error("Casting a negative vote. Do not decrease the vote count !")
    }

    const signer = wallet.connect(provider);
    const balanceBN = await provider.getBalance(wallet.address);
    const balance = Number(ethers.formatUnits(balanceBN));
    console.log(`\nWallet balance ${balance}`);
    if (balance < 0.01) {
        throw new Error("Not enough ether")
    }

    const ballotContract = new ethers.Contract(TokenContractAddress, BallotJSON.abi, signer);

    // call the Solidity's vote function
    await ballotContract.vote(proposal_id, amount);

    const proposal_voted = await ballotContract.proposals(proposal_id);
    console.log(`\nUpdated total vote for ${proposal_voted.name} = ${await proposal_voted.voteCount}.`);
    console.log(`Wallet balance ${balance}\n`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});