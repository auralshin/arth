// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IOrderMixin} from "@1inch/limit-order-protocol-contract/interfaces/IOrderMixin.sol";
import {TakerTraits} from "@1inch/limit-order-protocol-contract/libraries/TakerTraitsLib.sol";
import {Address, AddressLib} from "@1inch/solidity-utils/contracts/libraries/AddressLib.sol";

interface IWETH {
    function deposit() external payable;

    function withdraw(uint256) external;
}

contract OneInchLOPAdapter {
    using SafeERC20 for IERC20;

    error OrderFillFailed();
    error InvalidParameters();
    error NotRouter();

    event OrderFilled(
        bytes32 indexed orderHash,
        uint256 makingAmount,
        uint256 takingAmount
    );
    event Swept(address indexed token, address indexed to, uint256 amount);
    event Refunded(address indexed token, address indexed to, uint256 amount);

    address public immutable LOP;
    address public immutable WETH;
    address public immutable ROUTER;

    constructor(address lop, address weth, address router) {
        if (lop == address(0) || router == address(0))
            revert InvalidParameters();
        LOP = lop;
        WETH = weth; // can be zero on L2s without WETH path
        ROUTER = router;
    }

    modifier onlyRouter() {
        _onlyRouter();
        _;
    }

    function _onlyRouter()  internal view {
        if (msg.sender != ROUTER) revert NotRouter();
    }

    function _isWETH(IERC20 t) internal view returns (bool) {
        return WETH != address(0) && address(t) == WETH;
    }

    function _forceApprove(
        IERC20 token,
        address spender,
        uint256 amount
    ) internal {
        // Safe pattern for non-compliant ERC20s
        token.forceApprove(spender, 0);
        if (amount > 0) token.forceApprove(spender, amount);
    }

    /// @notice Fill a 1inch order (no extra args), sweep makerAsset to Router, refund taker leftovers to `refundTo`
    /// @param order        1inch v4 order struct (official type)
    /// @param signature    maker signature
    /// @param amount       taker-driven amount
    /// @param takerTraits  flags/threshold (official type)
    /// @param takerAsset   token we pay (WETH for ETH path)
    /// @param pullFromCaller amount of takerAsset to pull from msg.sender into this adapter before fill (0 to skip)
    /// @param makerAsset   expected maker token; must equal order.makerAsset
    /// @param sweepTo      recipient of makerAsset (your Router)
    /// @param refundTo     recipient of taker leftovers (typically Router too)
    function fillContractOrder(
        IOrderMixin.Order calldata order,
        bytes calldata signature,
        uint256 amount,
        TakerTraits takerTraits,
        IERC20 takerAsset,
        uint256 pullFromCaller,
        IERC20 makerAsset,
        address sweepTo,
        address refundTo
    )
        external
        payable
        onlyRouter
        returns (uint256 making, uint256 taking, bytes32 orderHash)
    {
        if (amount == 0 || sweepTo == address(0) || refundTo == address(0))
            revert InvalidParameters();
        if (address(makerAsset) != AddressLib.get(order.makerAsset))
            revert InvalidParameters();

        // Fund taker side
        uint256 preTakerBal = takerAsset.balanceOf(address(this));

        if (msg.value > 0) {
            // ETH path requires takerAsset == WETH
            if (!_isWETH(takerAsset)) revert InvalidParameters();
            IWETH(WETH).deposit{value: msg.value}();
        }
        if (pullFromCaller > 0) {
            takerAsset.safeTransferFrom(
                msg.sender,
                address(this),
                pullFromCaller
            );
        }

        // Approve LOP to spend *up to current balance*
        uint256 spendCap = takerAsset.balanceOf(address(this)) - preTakerBal;
        if (spendCap > 0) _forceApprove(takerAsset, LOP, spendCap);

        // Fill on 1inch
        try
            IOrderMixin(LOP).fillContractOrder(
                order,
                signature,
                amount,
                takerTraits
            )
        returns (uint256 m, uint256 t, bytes32 h) {
            making = m;
            taking = t;
            orderHash = h;
            emit OrderFilled(h, m, t);
        } catch {
            // reset approval before bubbling up
            if (spendCap > 0) _forceApprove(takerAsset, LOP, 0);
            revert OrderFillFailed();
        }

        // Reset approval
        if (spendCap > 0) _forceApprove(takerAsset, LOP, 0);

        // Sweep maker side to Router
        _sweepAll(makerAsset, sweepTo);

        // Refund any taker leftovers (ERC20 or WETH) to `refundTo`
        _refundTakerLeftovers(takerAsset, refundTo);
    }

    /// @notice Same as above but forwards taker args (permit/extension/interaction)
    function fillContractOrderArgs(
        IOrderMixin.Order calldata order,
        bytes calldata signature,
        uint256 amount,
        TakerTraits takerTraits,
        bytes calldata takerArgs,
        IERC20 takerAsset,
        uint256 pullFromCaller,
        IERC20 makerAsset,
        address sweepTo,
        address refundTo
    )
        external
        payable
        onlyRouter
        returns (uint256 making, uint256 taking, bytes32 orderHash)
    {
        if (amount == 0 || sweepTo == address(0) || refundTo == address(0))
            revert InvalidParameters();
        if (address(makerAsset) != AddressLib.get(order.makerAsset))
            revert InvalidParameters();

        uint256 preTakerBal = takerAsset.balanceOf(address(this));

        if (msg.value > 0) {
            if (!_isWETH(takerAsset)) revert InvalidParameters();
            IWETH(WETH).deposit{value: msg.value}();
        }
        if (pullFromCaller > 0) {
            takerAsset.safeTransferFrom(
                msg.sender,
                address(this),
                pullFromCaller
            );
        }

        uint256 spendCap = takerAsset.balanceOf(address(this)) - preTakerBal;
        if (spendCap > 0) _forceApprove(takerAsset, LOP, spendCap);

        try
            IOrderMixin(LOP).fillContractOrderArgs(
                order,
                signature,
                amount,
                takerTraits,
                takerArgs
            )
        returns (uint256 m, uint256 t, bytes32 h) {
            making = m;
            taking = t;
            orderHash = h;
            emit OrderFilled(h, m, t);
        } catch {
            if (spendCap > 0) _forceApprove(takerAsset, LOP, 0);
            revert OrderFillFailed();
        }

        if (spendCap > 0) _forceApprove(takerAsset, LOP, 0);

        _sweepAll(makerAsset, sweepTo);
        _refundTakerLeftovers(takerAsset, refundTo);
    }

    // --- helpers ---

    function _sweepAll(IERC20 token, address to) internal {
        uint256 bal = token.balanceOf(address(this));
        if (bal > 0) {
            token.safeTransfer(to, bal);
            emit Swept(address(token), to, bal);
        }
    }

    function _refundTakerLeftovers(IERC20 takerAsset, address to) internal {
        uint256 bal = takerAsset.balanceOf(address(this));
        if (bal > 0) {
            takerAsset.safeTransfer(to, bal);
            emit Refunded(address(takerAsset), to, bal);
        }
    }

    receive() external payable {}
}
