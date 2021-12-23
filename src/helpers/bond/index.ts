import { Networks } from "../../constants/blockchain";
import { LPBond, CustomLPBond } from "./lp-bond";
import { StableBond, CustomBond } from "./stable-bond";

import MimIcon from "../../assets/tokens/MIM.svg";
import AvaxIcon from "../../assets/tokens/AVAX.svg";
import MimTimeIcon from "../../assets/tokens/KANDY-MIM.png";
import AvaxTimeIcon from "../../assets/tokens/KANDY-AVAX.png";

import { StableBondContract, LpBondContract, WavaxBondContract, StableReserveContract, LpReserveContract } from "../../abi";

export const mim = new StableBond({
    name: "mim",
    displayName: "MIM",
    bondToken: "MIM",
    bondIconSvg: MimIcon,
    bondContractABI: StableBondContract,
    reserveContractAbi: StableReserveContract,
    networkAddrs: {
        [Networks.AVAX]: {
            bondAddress: "0xCF2CC69DDd1A36a9bE7Ac08595E3CD06fFcE6C69",
            reserveAddress: "0x130966628846BFd36ff31a822705796e8cb8C18D",
        },
        [Networks.BSCTEST]: {
            bondAddress: "",
            reserveAddress: "",
        },
    },
    tokensInStrategy: "",
    // tokensInStrategy: "60500000000000000000000000",
});

export const wavax = new CustomBond({
    name: "wavax",
    displayName: "wAVAX",
    bondToken: "AVAX",
    bondIconSvg: AvaxIcon,
    bondContractABI: WavaxBondContract,
    reserveContractAbi: StableReserveContract,
    networkAddrs: {
        [Networks.AVAX]: {
            bondAddress: "0x3c9eA1a1c635907988D434f4eF249CDBA2f76e25",
            reserveAddress: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
        },
        [Networks.BSCTEST]: {
            bondAddress: "",
            reserveAddress: "",
        },
    },
    tokensInStrategy: "",
    // tokensInStrategy: "756916000000000000000000",
});

export const mimKandy = new LPBond({
    name: "mim_time_lp",
    displayName: "KANDY-MIM LP",
    bondToken: "MIM",
    bondIconSvg: MimTimeIcon,
    bondContractABI: LpBondContract,
    reserveContractAbi: LpReserveContract,
    networkAddrs: {
        [Networks.AVAX]: {
            bondAddress: "0xAF2cC7aD895621503C0B76c347377911b1837775",
            reserveAddress: "0xADdc2fAb2c09aEE808Efed90f6509Ee6A24ab6aa",
        },
        [Networks.BSCTEST]: {
            bondAddress: "",
            reserveAddress: "",
        },
    },
    lpUrl: "https://www.traderjoexyz.com/#/pool/0x130966628846BFd36ff31a822705796e8cb8C18D/0xaf9Fc588A9860F43236D6b390A538305A26AA81D",
});

export const avaxKandy = new CustomLPBond({
    name: "avax_time_lp",
    displayName: "KANDY-AVAX LP",
    bondToken: "AVAX",
    bondIconSvg: AvaxTimeIcon,
    bondContractABI: LpBondContract,
    reserveContractAbi: LpReserveContract,
    networkAddrs: {
        [Networks.AVAX]: {
            bondAddress: "0x1EC222CF5898D592Fc6969f5eD6207bc6C20d086",
            reserveAddress: "0x3A577527C2194258dEcd06d65254d7EAb6af921C",
        },
        [Networks.BSCTEST]: {
            bondAddress: "",
            reserveAddress: "",
        },
    },
    lpUrl: "https://www.traderjoexyz.com/#/pool/AVAX/0xaf9Fc588A9860F43236D6b390A538305A26AA81D",
});

export default [mim, wavax, mimKandy, avaxKandy];

