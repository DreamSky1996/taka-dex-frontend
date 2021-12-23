import { ethers } from "ethers";
import { JsonRpcProvider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { ERC20Contract } from "../../abi";
import { getDEXAddress } from "../../constants";
import { Networks } from "../../constants/blockchain";

export const getTokenBalance = async (tokenAddress: string, accountAddress: string, provider: StaticJsonRpcProvider | JsonRpcProvider ) => {
    let ret: string = "";
    if(tokenAddress == "0x0000000000000000000000000000000000000000") {
        const balance = await provider.getBalance(accountAddress);
        ret = ethers.utils.formatEther(balance);
    } else {
        const contract = new ethers.Contract(tokenAddress, ERC20Contract, provider);
        const balance = await contract.balanceOf(accountAddress);
        ret = ethers.utils.formatEther(balance);
    }
    
    return ret;
}

export const routerHasTokenAllowance = async (tokenAddress: string, accountAddress: string, provider: StaticJsonRpcProvider | JsonRpcProvider ) => {
    if(tokenAddress == "0x0000000000000000000000000000000000000000") return true;
    const contract = new ethers.Contract(tokenAddress, ERC20Contract, provider);
    const addresses = getDEXAddress(Networks.BSCTEST);
    let allowance = await contract.allowance(accountAddress, addresses.TAKAROUTER_ADDRESS);
    return allowance.gt('0');
}