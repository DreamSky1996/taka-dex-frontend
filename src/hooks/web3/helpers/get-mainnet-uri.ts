import { Networks } from "../../../constants/blockchain";
export const getMainnetURI = (networkID: number): string => {
    
    switch (networkID) {
        case Networks.AVAX:
            return "https://api.avax.network/ext/bc/C/rpc";
        case Networks.BSCTEST:
            return "https://data-seed-prebsc-1-s1.binance.org:8545/";
        default:
            break;
    }
    return "";
};
