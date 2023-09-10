import { ethers } from "ethers";
import { MyToken, MyToken__factory } from "../typechain-types";
import * as dotenv from "dotenv";
import * as BallotJSON from "../artifacts/contracts/TokenizedBallot.sol/TokenizedBallot.json";
dotenv.config();

const setupProvider = () => {
    return new ethers.JsonRpcProvider(process.env.RPC_END_POINT ?? "");
}

async function main() {

    // Define provider and wallet
    const provider = setupProvider();
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);
    const signer = wallet.connect(provider);

    // Attach
    const ballotContract = new ethers.Contract(process.env.BALLOT_ADDRESS ?? "", BallotJSON.abi, signer);
    const tokenContractFactory = new MyToken__factory(signer);
    const tokenContract = tokenContractFactory.attach(process.env.VOTING_TOKEN_ADDRESS ?? "") as MyToken;

    // Check the voting power
    const votes = await ballotContract.votingPower(signer.address);
    console.log(`Account ${signer.address} has ${votes.toString()} units of voting power before self delegating\n`);

    // Self delegate
    const delegateTx = await tokenContract.connect(signer).delegate(signer.address);
    await delegateTx.wait();
    // how come this doesn't delegate for me? my voting power is still zero

    // Return the voting power after delegation
    const votesAfter = await ballotContract.votingPower(signer.address);
    console.log(`Account ${signer.address} has ${votesAfter.toString()} units of voting power after self delegating\n`);

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});