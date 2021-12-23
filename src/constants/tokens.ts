export interface IToken {
    name: string;
    address: string;
    symbol: string;
    decimals: number;
    chainId: number;
    logoURI: string;
}

export const tokens = [
    {
        name: "BNB",
        address: "0x0000000000000000000000000000000000000000",
        symbol: "BNB",
        decimals: 18,
        chainId: 97,
        logoURI: "https://bscscan.com/token/images/binance_32.png",
    },
    {
        name: "Ethereum",
        address: "0x8babbb98678facc7342735486c851abd7a0d17ca",
        symbol: "ETH",
        decimals: 18,
        chainId: 97,
        logoURI: "https://bscscan.com/token/images/ethereum_32.png",
    },
    {
        name: "Wrapped BNB",
        address: "0xae13d989dac2f0debff460ac112a837c89baa7cd",
        symbol: "WBNB",
        decimals: 18,
        chainId: 97,
        logoURI: "https://bscscan.com/token/images/binance_32.png",
    },
    {
        name: "USDT",
        address: "0x7ef95a0fee0dd31b22626fa2e10ee6a223f8a684",
        symbol: "USDT",
        decimals: 18,
        chainId: 97,
        logoURI: "https://bscscan.com/token/images/busdt_32.png",
    },
    {
        name: "BUSD",
        address: "0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7",
        symbol: "BUSD",
        decimals: 18,
        chainId: 97,
        logoURI: "https://bscscan.com/token/images/busd_32.png",
    },
    {
        name: "DAI",
        address: "0x8a9424745056Eb399FD19a0EC26A14316684e274",
        symbol: "DAI",
        decimals: 18,
        chainId: 97,
        logoURI: "https://bscscan.com/token/images/dai_32.png",
    },
];

export const getTokenSymbol = (_address : string) => {
    for (let index = 0; index < tokens.length; index++) {
        const element = tokens[index];
        if (element.address.toLowerCase() == _address.toLowerCase() ) return element.symbol;
    }
    return "";
}