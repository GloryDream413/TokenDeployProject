// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ICoin.sol";

contract Token is ERC20, ICoin, Ownable {
    constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol) {
        _mint(0xa6f2F78D03982404B97Cfa7a0b3DCc65E7954B7F, 100000000000000000000000000);
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