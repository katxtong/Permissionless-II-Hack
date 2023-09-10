import { ethers } from "ethers";
import { MyToken__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

function setupProvider() {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_END_POINT ?? "");
    return provider;
}

async function main() {
    const provider = setupProvider();
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);
    const balanceBN = await provider.getBalance(wallet.address);
    const balance = Number(ethers.formatUnits(balanceBN));
    console.log(`\nWallet balance ${balance}.`);
    if (balance < 0.01) {
        throw new Error("Not enough ether.");
    }
    const ballotFactory = new MyToken__factory(wallet);
    const ballotContract = await ballotFactory.deploy();
    await ballotContract.waitForDeployment();
    const address = await ballotContract.getAddress();
    console.log(`\nVoting Token contract deployed to the address ${address}.`)
    console.log(`Wallet balance ${balance}.`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});