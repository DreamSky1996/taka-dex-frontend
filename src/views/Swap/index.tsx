import { BigNumber, ethers } from "ethers";
import { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearPendingTxn, fetchPendingTxns, getStakingTypeText } from "../../store/slices/pending-txns-slice";
import { warning, success, info, error } from "../../store/slices/messages-slice";
import { Avatar, Grid, InputAdornment, OutlinedInput, Zoom } from "@material-ui/core";
import SwapVertIcon from "@material-ui/icons/SwapVert";
import { useWeb3Context } from "../../hooks";
import { IReduxState } from "../../store/slices/state.interface";
import "./swap.scss";
import { tokens, IToken, getTokenSymbol } from "../../constants/tokens";
import { getDEXAddress } from "../../constants";
import { Networks } from "../../constants/blockchain";
import { TakaRouterContract, ERC20Contract } from "../../abi";
import { getTokenBalance, routerHasTokenAllowance } from "../../helpers/swap";
import { trim } from "../../helpers";
import { getGasPrice } from "../../helpers/get-gas-price";
import { metamaskErrorWrap } from "../../helpers/metamask-error-wrap";
import { messages } from "../../constants/messages";
import TokenDialog from "./components/TokenDialog";

function Swap() {
    const dispatch = useDispatch();
    const { provider, address, connect, chainID, checkWrongNetwork, connected } = useWeb3Context();

    const [amountIn, setAmountIn] = useState<string>();
    const [hasGasfee, setHasGasfee] = useState<boolean>(false);
    const [tokenIN, setTokenIn] = useState<IToken>(tokens[2]);
    const [tokenINBalance, setTokenInBalance] = useState<string>();

    const [amountOut, setAmountOut] = useState<string>();
    const [tokenOut, setTokenOut] = useState<IToken>(tokens[4]);
    const [tokenOutBalance, setTokenOutBalance] = useState<string>();

    const [priceChecked, setPriceChecked] = useState<boolean>(false);
    const [priceCheckLoading, setPriceCheckedLoading] = useState<boolean>(false);
    const [swapping, setSwapping] = useState<boolean>(false);
    const [approving, setApproving] = useState<boolean>(false);

    const [openDialog, setTokenDialogOpen] = useState<boolean>(false);
    const [selectTokenIn, setSelectTokenIn] = useState<boolean>(false);
    const [tokenApprove, setTokenApprove] = useState<boolean>(true);

    const [amounts, setAmounts] = useState<BigNumber[]>([]);
    const [adapters, setAdapters] = useState<string[]>([]);
    const [path, setPath] = useState<string[]>([]);

    const update = async () => {
        getTokenBalance(tokenIN.address, address, provider).then(balance => {
            setTokenInBalance(balance);
        });
        getTokenBalance(tokenOut.address, address, provider).then(balance => {
            setTokenOutBalance(balance);
        });
    };

    useEffect(() => {
        if (connected) {
            getTokenBalance(tokenIN.address, address, provider).then(balance => {
                setTokenInBalance(balance);
            });
            getTokenBalance("0x0000000000000000000000000000000000000000", address, provider).then(balance => {
                setHasGasfee(Number(balance) > 0);
            });
            routerHasTokenAllowance(tokenIN.address, address, provider).then(allowance => {
                setTokenApprove(allowance);
            });
        }
    }, [tokenIN, connected]);

    useEffect(() => {
        if (connected) {
            getTokenBalance(tokenOut.address, address, provider).then(balance => {
                setTokenOutBalance(balance);
            });
        }
    }, [tokenOut, connected]);

    useEffect(() => {
        if (Number(amountIn) > 0) {
            onhandleCheckPrice();
        }
    }, [amountIn]);

    const setMax = () => {
        setAmountIn(tokenINBalance);
        setPriceChecked(false);
    };

    const findBestPath = async (_amountIn: string, _tokenInAddress: string, _tokenOutAddress: string, _maxSteps: number) => {
        const addresses = getDEXAddress(chainID);
        const amountInFormatted = ethers.utils.parseEther(_amountIn);
        const takaRouterContract = new ethers.Contract(addresses.TAKAROUTER_ADDRESS, TakaRouterContract, provider);
        const formattedOffer = await takaRouterContract.findBestPath(amountInFormatted, _tokenInAddress, _tokenOutAddress, _maxSteps);
        return formattedOffer;
    };

    const onhandleCheckPrice = async () => {
        if (Number(amountIn) == 0) {
            dispatch(info({ text: "Please Input Amount" }));
            return;
        }
        // if(amountIn && !priceCheckLoading) {
        if (amountIn) {
            console.log(Number(amountIn));
            if (tokenIN.address == tokenOut.address) {
                dispatch(info({ text: "Same Tokens" }));
                return;
            }
            setPriceCheckedLoading(true);

            let tokenInAddress = tokenIN.address;
            if (tokenInAddress == "0x0000000000000000000000000000000000000000") {
                tokenInAddress = "0xae13d989dac2f0debff460ac112a837c89baa7cd";
            }
            let tokenOutAddress = tokenOut.address;
            if (tokenOutAddress == "0x0000000000000000000000000000000000000000") {
                tokenOutAddress = "0xae13d989dac2f0debff460ac112a837c89baa7cd";
            }
            const formattedOffer = await findBestPath(amountIn, tokenInAddress, tokenOutAddress, 3);

            setAmounts(formattedOffer.amounts);
            setAdapters(formattedOffer.adapters);
            setPath(formattedOffer.path);
            const tokenOutAmount = ethers.utils.formatEther(formattedOffer.amounts[formattedOffer.amounts.length - 1]);
            setAmountOut(tokenOutAmount);
            setPriceChecked(true);
            setPriceCheckedLoading(false);
        }
    };

    const onhandleExchangeToken = () => {
        const _token = tokenIN;
        setTokenIn(tokenOut);
        setTokenOut(_token);
        setAmountOut("");
        setAmountIn("");
        setPriceChecked(false);
    };

    const getRouteSTR = () => {
        let ret = "";
        for (let index = 0; index < path.length; index++) {
            const item = path[index];
            const itemSymbol = getTokenSymbol(item);
            if (index == path.length - 1) {
                ret = ret + itemSymbol;
            } else {
                ret = ret + itemSymbol + " > ";
            }
        }
        return ret;
    };

    const onhandleSwap = async () => {
        if (!priceChecked) {
            dispatch(info({ text: "Please Check Price" }));
            return;
        }
        setSwapping(true);
        const signer = provider.getSigner();
        const addresses = getDEXAddress(chainID);
        const takaRouterContract = new ethers.Contract(addresses.TAKAROUTER_ADDRESS, TakaRouterContract, signer);
        const _amountOut = (Number(amountOut) * 99.8) / 100;
        let swapTx;
        try {
            const gasPrice = await getGasPrice(provider);
            interface ITrade {
                amountIn: BigNumber;
                amountOut: BigNumber;
                path: string[];
                adapters: string[];
            }

            const mimAmountOut = ethers.utils.parseEther(_amountOut.toString());
            const trade: ITrade = { amountIn: amounts[0], amountOut: mimAmountOut, path: path, adapters: adapters };
            if (tokenIN.address == "0x0000000000000000000000000000000000000000") {
                swapTx = await takaRouterContract.swapNoSplitFromAVAX(trade, address, 0, { value: trade.amountIn, gasPrice });
            } else if (tokenOut.address == "0x0000000000000000000000000000000000000000") {
                swapTx = await takaRouterContract.swapNoSplitToAVAX(trade, address, 0, { gasPrice });
            } else {
                swapTx = await takaRouterContract.swapNoSplit(trade, address, 0, { gasPrice });
            }

            const pendingTxnType = "swapping";
            dispatch(fetchPendingTxns({ txnHash: swapTx.hash, text: "swapping", type: pendingTxnType }));
            await swapTx.wait();
            dispatch(success({ text: messages.tx_successfully_send }));
        } catch (error: any) {
            setSwapping(false);
            return metamaskErrorWrap(error, dispatch);
        } finally {
            setSwapping(false);
            if (swapTx) {
                dispatch(clearPendingTxn(swapTx.hash));
            }
        }
        setSwapping(false);
        dispatch(info({ text: messages.your_balance_update_soon }));
        await update();
        setAmountOut("");
        setAmountIn("");
        setPriceChecked(false);
        dispatch(info({ text: messages.your_balance_updated }));
    };

    const onhandleApprove = async () => {
        setApproving(true);
        const signer = provider.getSigner();
        const addresses = getDEXAddress(chainID);
        let approveTx;
        const data = "0x095ea7b3" + addresses.TAKAROUTER_ADDRESS.slice(2).padStart(64, "0") + ethers.constants.MaxUint256.toHexString().slice(2).padStart(64, "0");
        try {
            const gasPrice = await getGasPrice(provider);
            approveTx = await signer.sendTransaction({
                to: tokenIN.address,
                data: data,
            });
            const pendingTxnType = "approving";
            dispatch(fetchPendingTxns({ txnHash: approveTx.hash, text: "approving", type: pendingTxnType }));
            await approveTx.wait();
            dispatch(success({ text: messages.tx_successfully_send }));
            setTokenApprove(true);
        } catch (error: any) {
            setApproving(false);
            return metamaskErrorWrap(error, dispatch);
        } finally {
            setApproving(false);
            if (approveTx) {
                dispatch(clearPendingTxn(approveTx.hash));
            }
        }
        setApproving(false);
    };

    const onhandleClickOpenDialog = (isIn: boolean) => {
        setSelectTokenIn(isIn);
        setTokenDialogOpen(true);
    };

    const onhandleDialogClose = (value: IToken | null) => {
        setTokenDialogOpen(false);
        if (value) {
            if (selectTokenIn) {
                setTokenIn(value);
            } else {
                setTokenOut(value);
            }
        }
        setAmountOut("");
        setAmountIn("");
        setPriceChecked(false);
    };

    const onhandleChangeTokenMount = async (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setAmountIn(e.target.value);
        setPriceChecked(false);
        setAmountOut("");
    };

    return (
        <div className="swap-view">
            <TokenDialog open={openDialog} onClose={onhandleDialogClose} />
            <Zoom in={true}>
                <div className="swap-card">
                    <Grid className="swap-card-grid" container direction="column" spacing={2}>
                        <Grid item>
                            <div className="swap-card-header">
                                <p className="swap-card-header-title">Swap</p>
                            </div>
                        </Grid>

                        <div className="swap-card-area">
                            <div className="swap-card-action-area">
                                <div className="swap-card-text-balance">
                                    <p>SEND</p>
                                    {address && tokenINBalance && (
                                        <p>
                                            {trim(Number(tokenINBalance), 4)} {tokenIN.symbol}
                                        </p>
                                    )}
                                </div>
                                <div className="swap-card-action-row">
                                    <OutlinedInput
                                        type="number"
                                        placeholder="Amount"
                                        className="swap-card-action-input"
                                        value={amountIn}
                                        onChange={e => onhandleChangeTokenMount(e)}
                                        labelWidth={0}
                                        startAdornment={
                                            <InputAdornment position="end">
                                                <div className="swap-card-action-coin-btn" onClick={() => onhandleClickOpenDialog(true)}>
                                                    <Avatar className="swap-card-action-coin-img" src={tokenIN.logoURI} />
                                                    <p>{tokenIN.symbol}</p>
                                                </div>
                                            </InputAdornment>
                                        }
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <div onClick={setMax} className="swap-card-action-input-btn">
                                                    <p>Max</p>
                                                </div>
                                            </InputAdornment>
                                        }
                                    />
                                </div>
                            </div>
                            <div className="swap-card-wallet-notification">
                                <div className="swap-card-ex-btn" onClick={onhandleExchangeToken}>
                                    <p>
                                        <SwapVertIcon />
                                    </p>
                                </div>
                            </div>
                            <div className="swap-card-action-area">
                                <div className="swap-card-text-balance">
                                    <p>RECEIVE</p>
                                    {address && tokenOutBalance && (
                                        <p>
                                            {trim(Number(tokenOutBalance), 4)} {tokenOut.symbol}
                                        </p>
                                    )}
                                </div>
                                <div className="swap-card-action-row">
                                    <OutlinedInput
                                        type="number"
                                        placeholder=""
                                        className="swap-card-action-input"
                                        value={amountOut}
                                        onChange={e => setAmountOut(e.target.value)}
                                        labelWidth={0}
                                        startAdornment={
                                            <InputAdornment position="end">
                                                <div className="swap-card-action-coin-btn" onClick={() => onhandleClickOpenDialog(false)}>
                                                    <Avatar className="swap-card-action-coin-img" src={tokenOut.logoURI} />
                                                    <p>{tokenOut.symbol}</p>
                                                </div>
                                            </InputAdornment>
                                        }
                                        disabled
                                    />
                                </div>
                            </div>
                            {priceChecked && (
                                <div className="swap-trad-info">
                                    <div className="">
                                        <p>Price</p>
                                        <p>
                                            {trim(Number(amountIn) / Number(amountOut), 6)} {tokenIN.symbol}/{tokenOut.symbol}
                                        </p>
                                    </div>
                                    <div className="">
                                        <p>Allowed Slippage</p>
                                        <p>0.20%</p>
                                    </div>
                                    <div className="">
                                        <p>Min. to Receive</p>
                                        <p>
                                            {trim((Number(amountOut) * 99.8) / 100, 6)} {tokenOut.symbol}
                                        </p>
                                    </div>
                                    <div className="">
                                        <p>Path</p>
                                        <p>{getRouteSTR()}</p>
                                    </div>
                                </div>
                            )}
                            <div className="swap-card-wallet-notification">
                                {/* <div className="swap-card-wallet-connect-btn" onClick={onhandleCheckPrice}>
                                   {!priceCheckLoading && (
                                       <p>{priceChecked? "Refresh Prices": "Check Prices"}</p>
                                    )}
                                    {priceCheckLoading && (
                                       <p>loading ... </p>
                                    )} 
                                </div> */}
                                {!address && (
                                    <div className="swap-card-wallet-connect-btn" onClick={connect}>
                                        <p>Connect Wallet</p>
                                    </div>
                                )}
                                {address && (hasGasfee ? (
                                    tokenApprove ? (
                                        <div className="swap-card-wallet-connect-btn" onClick={onhandleSwap}>
                                            <p>{swapping ? "Swapping" : "Swap"}</p>
                                        </div>
                                    ) : (
                                        <div className="swap-card-wallet-connect-btn" onClick={onhandleApprove}>
                                            <p>{approving ? "Approving" : "Approve"}</p>
                                        </div>
                                    )
                                ) : (
                                    <div className="swap-card-wallet-connect-btn">
                                        <p>Insufficient BNB Balance</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Grid>
                </div>
            </Zoom>
        </div>
    );
}

export default Swap;
