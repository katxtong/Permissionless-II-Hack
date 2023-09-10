import { ethers } from "ethers";
import { MyToken, MyToken__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

const MINT_VALUE = ethers.parseUnits("1");

// will need to mint before deploying ballot, since ballot takes a snapshot in time
// (specified at current block as of deployment 8/31/23)
// we will need to have minted tokens before then

function setupProvider() {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_END_POINT ?? "");
    return provider;
}

async function main() {
    // Define provider and wallet
    const provider = setupProvider();
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);
    const signer = wallet.connect(provider);

    // Attach
    const tokenContractFactory = new MyToken__factory(signer);
    const tokenContract = tokenContractFactory.attach(process.env.VOTING_TOKEN_ADDRESS ?? "") as MyToken;

    // Mint some tokens
    const mintTx = await tokenContract.mint(signer.address, MINT_VALUE);
    await mintTx.wait();
    console.log(`Minted ${MINT_VALUE.toString()} decimal units to account ${signer.address}.\n`);
    const balanceBN = await tokenContract.balanceOf(signer.address);
    console.log(`Account ${signer.address} has ${balanceBN.toString()} decimal units of VoteToken.\n`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});