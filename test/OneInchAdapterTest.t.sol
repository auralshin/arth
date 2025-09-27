// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/console.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {OneInchLOPAdapter} from "../src/integrations/OneInchLOPAdapter.sol";
import {IOrderMixin} from "@1inch/limit-order-protocol-contract/interfaces/IOrderMixin.sol";
import {TakerTraits, TakerTraitsLib} from "@1inch/limit-order-protocol-contract/libraries/TakerTraitsLib.sol";
import {Address, AddressLib} from "@1inch/solidity-utils/contracts/libraries/AddressLib.sol";
import {MakerTraits, MakerTraitsLib} from "@1inch/limit-order-protocol-contract/libraries/MakerTraitsLib.sol";

/// @title Mock ERC20 Token
contract MockERC20 is IERC20 {
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    constructor(string memory _name, string memory _symbol, uint256 _supply) {
        name = _name;
        symbol = _symbol;
        totalSupply = _supply;
        balanceOf[msg.sender] = _supply;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool) {
        if (allowance[from][msg.sender] != type(uint256).max) {
            allowance[from][msg.sender] -= amount;
        }
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function mint(address to, uint256 amount) external {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }
}

/// @title Minimal Mock for 1inch LOP - Only implements what we need
contract MockLimitOrderProtocol {
    using SafeERC20 for IERC20;

    mapping(bytes32 => bool) public filledOrders;
    mapping(address => uint256) public nonces;

    event OrderFilled(
        bytes32 indexed orderHash,
        uint256 making,
        uint256 taking
    );

    /// @notice Minimal implementation just for testing the adapter logic
    function fillContractOrder(
        IOrderMixin.Order calldata order,
        bytes calldata /* signature */,
        uint256 amount,
        TakerTraits /* takerTraits */
    )
        external
        returns (uint256 makingAmount, uint256 takingAmount, bytes32 orderHash)
    {
        // Get addresses from 1inch Address types
        address maker = AddressLib.get(order.maker);
        address makerAsset = AddressLib.get(order.makerAsset);
        address takerAsset = AddressLib.get(order.takerAsset);

        orderHash = keccak256(abi.encode(order, nonces[maker]++));
        require(!filledOrders[orderHash], "Order already filled");
        filledOrders[orderHash] = true;

        // Calculate fill amounts
        if (amount > order.takingAmount) amount = order.takingAmount;
        takingAmount = amount;
        makingAmount = (amount * order.makingAmount) / order.takingAmount;

        // Transfer tokens
        IERC20(takerAsset).safeTransferFrom(msg.sender, maker, takingAmount);
        IERC20(makerAsset).safeTransferFrom(maker, msg.sender, makingAmount);

        emit OrderFilled(orderHash, makingAmount, takingAmount);
    }

    /// @notice With args version
    function fillContractOrderArgs(
        IOrderMixin.Order calldata order,
        bytes calldata /* signature */,
        uint256 amount,
        TakerTraits /* takerTraits */,
        bytes calldata /* args */
    )
        external
        returns (uint256 makingAmount, uint256 takingAmount, bytes32 orderHash)
    {
        // Get addresses from 1inch Address types
        address maker = AddressLib.get(order.maker);
        address makerAsset = AddressLib.get(order.makerAsset);
        address takerAsset = AddressLib.get(order.takerAsset);

        orderHash = keccak256(abi.encode(order, nonces[maker]++));
        require(!filledOrders[orderHash], "Order already filled");
        filledOrders[orderHash] = true;

        // Calculate fill amounts
        if (amount > order.takingAmount) amount = order.takingAmount;
        takingAmount = amount;
        makingAmount = (amount * order.makingAmount) / order.takingAmount;

        // Transfer tokens
        IERC20(takerAsset).safeTransferFrom(msg.sender, maker, takingAmount);
        IERC20(makerAsset).safeTransferFrom(maker, msg.sender, makingAmount);

        emit OrderFilled(orderHash, makingAmount, takingAmount);
    }
}

/// @title OneInch Adapter Test Suite
/// @notice Focused test for the actual adapter functionality we built
contract OneInchAdapterTest is Test {
    using SafeERC20 for IERC20;

    MockLimitOrderProtocol public mockLOP;
    OneInchLOPAdapter public lopAdapter;
    MockERC20 public weth;
    MockERC20 public usdc;

    address public router = address(0x1111);
    address public trader = address(0x1234);
    address public maker = address(0x5678);

    function setUp() public {
        // Create test tokens
        weth = new MockERC20("Wrapped ETH", "WETH", 1000 ether);
        usdc = new MockERC20("USD Coin", "USDC", 1000000 * 1e6);

        // Deploy mock LOP and adapter (with router parameter)
        mockLOP = new MockLimitOrderProtocol();
        lopAdapter = new OneInchLOPAdapter(
            address(mockLOP),
            address(weth),
            router
        );

        // Fund accounts
        weth.mint(trader, 100 ether);
        usdc.mint(trader, 10000 * 1e6);
        weth.mint(maker, 50 ether);
        usdc.mint(maker, 5000 * 1e6);

        // Approvals
        vm.startPrank(maker);
        weth.approve(address(mockLOP), type(uint256).max);
        usdc.approve(address(mockLOP), type(uint256).max);
        vm.stopPrank();
    }

    /// @notice Test adapter access control (onlyRouter modifier)
    function testOnlyRouterAccess() public {
        // Create a dummy order
        IOrderMixin.Order memory order = _createTestOrder();

        // Try calling from non-router address - should revert
        vm.prank(trader);
        vm.expectRevert(OneInchLOPAdapter.NotRouter.selector);
        lopAdapter.fillContractOrder(
            order,
            hex"", // signature
            1000 * 1e6, // amount
            TakerTraits.wrap(0), // takerTraits
            IERC20(address(usdc)), // takerAsset
            1000 * 1e6, // pullFromCaller
            IERC20(address(weth)), // makerAsset
            trader, // sweepTo
            trader // refundTo
        );

        console.log("SUCCESS: onlyRouter modifier working correctly");
    }

    /// @notice Test makerAsset validation
    function testMakerAssetValidation() public {
        IOrderMixin.Order memory order = _createTestOrder();

        // Try with wrong makerAsset - should revert
        vm.prank(router);
        vm.expectRevert(OneInchLOPAdapter.InvalidParameters.selector);
        lopAdapter.fillContractOrder(
            order,
            hex"",
            1000 * 1e6,
            TakerTraits.wrap(0),
            IERC20(address(usdc)), // takerAsset
            1000 * 1e6,
            IERC20(address(usdc)), // Wrong! Should be weth
            trader,
            trader
        );

        console.log("SUCCESS: makerAsset validation working correctly");
    }

    /// @notice Test basic ERC20 pull-from-caller functionality
    function testERC20PullFromCaller() public {
        IOrderMixin.Order memory order = _createTestOrder();

        // Give router tokens
        usdc.mint(router, 2000 * 1e6);

        uint256 routerUsdcBefore = usdc.balanceOf(router);
        uint256 routerWethBefore = weth.balanceOf(router);
        uint256 makerUsdcBefore = usdc.balanceOf(maker);
        uint256 makerWethBefore = weth.balanceOf(maker);

        // Use ONE prank session: approve + call, then stop.
        vm.startPrank(router);
        usdc.approve(address(lopAdapter), 2000 * 1e6);

        (uint256 making, uint256 taking, ) = lopAdapter.fillContractOrder(
            order,
            hex"", // sig (mock)
            1000 * 1e6, // amount
            TakerTraits.wrap(0), // takerTraits
            IERC20(address(usdc)), // takerAsset
            1000 * 1e6, // pullFromCaller
            IERC20(address(weth)), // makerAsset
            router, // sweepTo
            router // refundTo
        );
        vm.stopPrank();

        // Assertions
        assertEq(
            usdc.balanceOf(router),
            routerUsdcBefore - taking,
            "router spent USDC"
        );
        assertEq(
            weth.balanceOf(router),
            routerWethBefore + making,
            "router got WETH"
        );
        assertEq(
            usdc.balanceOf(maker),
            makerUsdcBefore + taking,
            "maker got USDC"
        );
        assertEq(
            weth.balanceOf(maker),
            makerWethBefore - making,
            "maker gave WETH"
        );

        console.log("Making (WETH):", making);
        console.log("Taking (USDC):", taking);
        console.log("SUCCESS: ERC20 pull-from-caller working correctly");
    }

    /// @notice Helper to create a test order with proper 1inch types
    function _createTestOrder()
        internal
        view
        returns (IOrderMixin.Order memory)
    {
        return
            IOrderMixin.Order({
                salt: 1,
                maker: Address.wrap(uint256(uint160(maker))),
                receiver: Address.wrap(uint256(uint160(maker))),
                makerAsset: Address.wrap(uint256(uint160(address(weth)))), // Maker gives WETH
                takerAsset: Address.wrap(uint256(uint160(address(usdc)))), // Maker wants USDC
                makingAmount: 1 ether, // 1 WETH
                takingAmount: 2000 * 1e6, // for 2000 USDC
                makerTraits: MakerTraits.wrap(0)
            });
    }
}
