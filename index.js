const express = require('express');
const { ethers } = require('ethers');
const env = require('dotenv');
const fs = require('fs');
env.config();

const uniswapRouterAbi = JSON.parse(fs.readFileSync('./Abis/uniswapRouterAbi.json'));
const UNIcontractAbi = JSON.parse(fs.readFileSync('./Abis/UNIcontractAbi.json'));

const uniswapRouterAddress = process.env.routerAddress;
const UNItokenAddress = process.env.UniAddress;
const privateKey = process.env.privateKey;
const rpcUrl = process.env.rpcURL;

const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const signer = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(uniswapRouterAddress, uniswapRouterAbi, signer);
const tokenContract = new ethers.Contract(UNItokenAddress, UNIcontractAbi, signer);

const amountIn = ethers.utils.parseEther('0.0');
const amountoutMin = ethers.utils.parseEther('0')
let deadline = Math.floor(Date.now() / 1000) + 300; 
console.log("amountoutMin",amountoutMin.toString())
console.log("amountIn",amountIn.toString())

const to = '0xDE4CA679E16c6ECdb84fd8a9631bF3A16C7c6bdE';
const path = ['0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6', '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'];

async function getPrice() {
    const getPrice = await contract.getAmountsOut(amountIn, path);
    const price = ethers.utils.formatEther(getPrice[1], 18);
    console.log("amountOut: ", price);
}

async function swapEthForToken(){
    const swapEthForToken = await contract.functions.swapExactETHForTokens(amountoutMin, path, to, deadline, {
        gasLimit : 300000,
        value : amountIn,
    });
    await swapEthForToken.wait();
    console.log("swapExactETHForTokens hash: ",swapEthForToken);
}

getPrice();
swapEthForToken()
