const express = require('express');
const router = express.Router();
const web3Control = require('../models/web3/web3control');
const abi = require('../config/abi.js')

router.get('/whitelist/', async (req, res) => {
    let ret_data
    try {
        const queryInfo = {
            api_version : req.query.api_version.toLowerCase(),
            ico_address : req.query.ico_addr.toLowerCase(),
            wallet_address : req.query.wallet_addr === undefined ? null : req.query.wallet_addr.toLowerCase(),
            ico_abi : abi.getContractABI('ico_abi'),
        }
        const found_whitelist = await web3Control.getIcoWhitelist(queryInfo)
        ret_data = {
            'status' : found_whitelist === -1 ? '0' : '1',
            "message" : found_whitelist === -1 ? 'Fail to get whitelist.' : '',
            'result' : found_whitelist === -1 ? '' : found_whitelist,
        }
    } catch (error) {
        ret_data = {
            'status' : '0',
            "message": 'Fail to get whitelist',
            'result' : {
                'whitelist' : []
            } 
        }        
    }
    res.send(ret_data)
});

router.get('/transaction_list/', async (req, res) => {
    let ret_data
    let found_tx_list
    try {
        const queryInfo = {
            api_version : req.query.api_version.toLowerCase(),
            ico_address : req.query.ico_addr.toLowerCase(),
            contract_address : req.query.contract_addr.toLowerCase(),
            owner_address : req.query.owner_addr.toLowerCase(),
            wallet_address : req.query.wallet_addr === undefined ? null : req.query.wallet_addr.toLowerCase(),
            start_block : req.query.start_block === undefined ? null : req.query.start_block,
            end_block : req.query.end_block === undefined ? null : req.query.end_block,
            network_type : req.query.network_type === undefined ? 'mainnet' : req.query.network_type,
        }

        if (req.query.internal === undefined || req.query.internal === '0') {
            found_tx_list = await web3Control.getIcoTransactionList(queryInfo)
        } else {
            found_tx_list = await web3Control.getInternalTransactionList(queryInfo)
        }
        ret_data = {
            'status' : found_tx_list === -1 ? '0' : '1',
            "message" : found_tx_list === -1 ? 'Fail to get transaction_list' : '',
            'result' : found_tx_list === -1 ? '' : found_tx_list,
        }
    } catch (error) {
        ret_data = {
            'status' : '0',
            "message": 'Fail to get transaction_list',
            'result' : {
                'invest_eth' : '',
                'distributed_blc' : '',
                'transaction_list' : []
            } 
        }        
    }
    res.send(ret_data)
});

router.get('/fund_amount/', async (req, res) => {    
    let ret_data
    try {
        let eth_amount
        let blc_amount        

        const queryInfo = {
            api_version : req.query.api_version.toLowerCase(),
            ico_address : req.query.ico_addr.toLowerCase(),
            contract_address : req.query.contract_addr.toLowerCase(),
            owner_address : req.query.owner_addr.toLowerCase(),
            wallet_address : req.query.wallet_addr === undefined ? null : req.query.wallet_addr.toLowerCase(),
            start_block : req.query.start_block === undefined ? null : req.query.start_block,
            end_block : req.query.end_block === undefined ? null : req.query.end_block,
            network_type : req.query.network_type === undefined ? 'mainnet' : req.query.network_type,
        }
        
        if (req.query.wallet_addr === undefined){
            eth_amount = await web3Control.getIcoInvestedEth(queryInfo)
            blc_amount = await web3Control.getIcoDistributeBlc(queryInfo)
        } else {
            eth_amount = await web3Control.getUserInvesteEth(queryInfo)
            blc_amount = await web3Control.getUserDistributedBlc(queryInfo)
        }
        ret_data = {
            'status' : (eth_amount === -1 || blc_amount === -1) ? '0' : '1',
            "message" : (eth_amount === -1 || blc_amount === -1) ? 'Fail to get fund_amount' : '',
            'result' : {
                'eth_amount' : (eth_amount === -1 || blc_amount === -1) ? '' : eth_amount,
                'blc_amount' : (eth_amount === -1 || blc_amount === -1) ? '' : blc_amount,
            } 
        }
    } catch (error) {
        ret_data = {
            'status' : '0',
            "message": 'Fail to get fund_amount',
            'result' : {
                'eth_amount' : '',
                'blc_amount' : ''
            } 
        }        
    }
    res.send(ret_data)
});


module.exports = router;
