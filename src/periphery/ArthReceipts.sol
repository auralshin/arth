// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/src/types/PoolId.sol";

interface ArthV4RouterMinimal {
    function settleFundingToken1(
        PoolKey calldata key,
        int24 lower,
        int24 upper,
        bytes32 salt,
        address owner,
        address recipient
    ) external;
}

contract ArthReceipts is ERC721, Ownable, AccessControl {
    using PoolIdLibrary for PoolKey;

    struct PositionInfo {
        PoolId id;
        int24 tickLower;
        int24 tickUpper;
        bytes32 salt;
        address hook;
    }

    uint256 public nextId = 1;
    mapping(uint256 => PositionInfo) public positionOf;

    address public ROUTER;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    event Minted(uint256 tokenId, address owner, PoolId id, int24 lower, int24 upper, bytes32 salt);
    event Redeemed(uint256 tokenId, int256 funding, address to);
    event RouterUpdated(address indexed oldRouter, address indexed newRouter);

    constructor(address admin, address router) ERC721("Arth Position", "ARTH") Ownable(admin) {
        ROUTER = router;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        if (router != address(0)) {
            _grantRole(MINTER_ROLE, router);
        }
    }

    function setRouter(address newRouter) external onlyOwner {
        address old = ROUTER;
        ROUTER = newRouter;
        emit RouterUpdated(old, newRouter);
    }

    function mint(
        address to,
        PoolKey calldata key,
        int24 lower,
        int24 upper,
        bytes32 salt,
        address hook
    ) external onlyRole(MINTER_ROLE) returns (uint256 tokenId) {
        tokenId = nextId++;
        _safeMint(to, tokenId);
        positionOf[tokenId] = PositionInfo({
            id: key.toId(),
            tickLower: lower,
            tickUpper: upper,
            salt: salt,
            hook: hook
        });
        emit Minted(tokenId, to, key.toId(), lower, upper, salt);
    }

    function redeem(uint256 tokenId, PoolKey calldata key) external {
        require(ownerOf(tokenId) == msg.sender, "NOT_OWNER");
        PositionInfo memory p = positionOf[tokenId];
        require(PoolId.unwrap(p.id) == PoolId.unwrap(key.toId()), "POOL_MISMATCH");

        ArthV4RouterMinimal(ROUTER).settleFundingToken1(
            key, p.tickLower, p.tickUpper, p.salt, msg.sender, msg.sender
        );

        emit Redeemed(tokenId, 0, msg.sender);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
