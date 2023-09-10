import { ethers } from "ethers";
import { MyToken, MyToken__factory } from "../typechain-types";
import * as dotenv from "dotenv";
import * as BallotJSON from "../artifacts/contracts/TokenizedBallot.sol/TokenizedBallot.json";
dotenv.config();

function setupProvider() {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_END_POINT ?? "");
    return provider;
}

async function main() {

    const provider = setupProvider();
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);
    const signer = wallet.connect(provider);
    // const balanceBN = await provider.getBalance(wallet.address);
    
    // Attach
    const ballotContract = new ethers.Contract(process.env.BALLOT_ADDRESS ?? "", BallotJSON.abi, signer);
    const tokenContractFactory = new MyToken__factory(signer);
    const tokenContract = tokenContractFactory.attach(process.env.VOTING_TOKEN_ADDRESS ?? "") as MyToken;
    
    const balanceBN = await tokenContract.balanceOf(signer.address);
    const balance = Number(ethers.formatUnits(balanceBN));
    console.log(`Wallet balance: ${balance}`);
    if (balance < 0.01) {
        throw new Error("Not enough ether");
    }

    // Check the voting power
    const votes = await ballotContract.votingPower(signer.address);
    console.log(`Account ${signer.address} has ${votes.toString()} units of voting power.\n`);

    // Check balances and return value
    console.log(`Account ${signer.address} has ${balanceBN.toString()} decimal units of MyToken\n`);

}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});