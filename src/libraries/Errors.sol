// SPDX-License-Identifier: MIT
pragma solidity =0.8.26;

library Errors {
    
    error NotAuthorized();
    
    error NotOwner();
    
    error NotOperator();
    
    error NotPoolManager();
    
    error NotRouter();
    
    error NotFactory();
    
    error NotManager();
    
    error SystemFrozen();
    
    error OperatorsFrozen();

    
    error ZeroAddress();
    
    error AdminZero();
    
    error InvalidOwner();

    
    error InvalidPPM();
    
    error InvalidBPS();
    
    error DecimalsTooLarge();
    
    error DecimalsMismatch();
    
    error HaircutTooHigh();
    
    error PenaltyTooHigh();
    
    error FeeShareTooHigh();
    
    error InvalidHealthFactorCritical();
    
    error InvalidDurationFactor();
    
    error AmountZero();
    
    error SaltRequired();

    
    error TokenNotSupported();
    
    error UnknownCollateral();
    
    error CollateralDisabled();
    
    error InsufficientCollateral();
    
    error NoTokensReceived();
    
    error TransferFailed();

    
    error NotOracle();
    
    error PriceTooStale();
    
    error PriceConfidenceTooLow();
    
    error PythNotEnabled();
    
    error PythAdapterNotSet();
    
    error PythIdNotConfigured();
    
    error UnsupportedFeed(bytes32 feedId);
    
    error StalePrice(bytes32 feedId, uint64 publishTime, uint256 maxAge);
    
    error InsufficientFee(uint256 required, uint256 provided);
    
    error ConfidenceTooHigh(bytes32 feedId, uint256 confidence, uint256 price, uint256 maxBps);
    
    error InvalidPrice(bytes32 feedId, int64 price);
    
    error InvalidConfidence(bytes32 feedId, uint256 confidence);

    
    error InvalidSource();
    
    error SourceAlreadyExists();
    
    error SourceNotRegistered();
    
    error UnderlyingMismatch();

    
    error InsufficientEquity();
    
    error IMBreach();
    
    error WithdrawIMBreach();
    
    error NotLiquidatable();
    
    error InsufficientCollateralToSeize();

    
    error PoolNotEnabled();
    
    error PoolDisabled();
    
    error PoolMatured();
    
    error PoolFrozen();
    
    error PoolMismatch();
    
    error NoExistingPosition();
    
    error BurnExceedsLiquidity();
    
    error AccountNotionalCap();
    
    error LiquidityUnderflow();
    
    error PoolLiquidityUnderflow();

    
    error HookFlagsMismatch();
    
    error UseRouter();

    error LiquidityDeltaTooLarge();

    error ETHSendFailed();
    
    error MulticallFailed();
    
    error MaxPaymentExceeded();
    
    error BadOperation();
    
    error NativeFlagRequired();
    
    error InsufficientMsgValue();
    
    error RefundFailed();
    
    error SendFailed();
    
    error CapsExceeded();

    
    error NotTokenOwner();

    
    error LiquidityCapsExceeded();
}