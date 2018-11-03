const express = require('express');
const router = express.Router();
const web3Control = require('../models/web3/web3control')


router.get('/balance/', async (req, res) => {    
    let ret_data
    try {
        const queryInfo = {
            api_version : req.query.api_version.toLowerCase(),
            wallet_address : req.query.wallet_addr.toLowerCase(),
            contract_address : req.query.contract_addr === undefined ? null : req.query.contract_addr.toLowerCase(),            
            network_type : req.query.network_type === undefined ? 'mainnet' : req.query.network_type,
        }
        const current_block = await web3Control.getBalance(queryInfo)
        ret_data = {
            'status' : current_block === -1 ? '0' : '1',
            "message" : current_block === -1 ? 'Fail to get current_block' : '',
            'result' : current_block === -1 ? '' : current_block,
        }
    }
    catch {
        ret_data = {
            'status' : '0',
            "message": 'Fail to get current_block',
            'result' : {
                'current_block' : ''
            } 
        } 
    }
    res.send(ret_data)
});


router.get('/current_eth_block/', async (req, res) => {    
    let ret_data
    try {
        const queryInfo = {
            api_version : req.query.api_version.toLowerCase(),
            network_type : req.query.network_type === undefined ? 'mainnet' : req.query.network_type,
        }
        const current_block = await web3Control.getCurrentBlock(queryInfo)
        ret_data = {
            'status' : current_block === -1 ? '0' : '1',
            "message" : current_block === -1 ? 'Fail to get current_block' : '',
            'result' : current_block === -1 ? '' : current_block,
        }
    }
    catch {
        ret_data = {
            'status' : '0',
            "message": 'Fail to get current_block',
            'result' : {
                'current_block' : ''
            } 
        } 
    }
    res.send(ret_data)
});

router.get('/transaction_list/', async (req, res) => {
    let ret_data
    try {
        const queryInfo = {
            api_version : req.query.api_version.toLowerCase(),
            contract_address : req.query.contract_addr.toLowerCase(),
            wallet_address : req.query.wallet_addr.toLowerCase(),
            start_block : req.query.start_block === undefined ? null : req.query.start_block,
            end_block : req.query.end_block === undefined ? null : req.query.end_block,
            network_type : req.query.network_type === undefined ? 'mainnet' : req.query.network_type,
        }
        const found_tx_list = await web3Control.getTransactionList(queryInfo)        
        ret_data = {
            'status' : found_tx_list === -1 ? '0' : '1',
            "message" : found_tx_list === -1 ? 'Fail to get transaction_list' : '',
            'result' : found_tx_list === -1 ? '' : found_tx_list,
        }
    }
    catch {
        ret_data = {
            'status' : '0',
            "message": 'Fail to get transaction_list',
            'result' : {
                'transaction_list' : []
            } 
        }        
    }
    res.send(ret_data)
});


router.get('/transaction_list/eth/', async (req, res) => {
    let ret_data
    try {
        const queryInfo = {
            api_version : req.query.api_version.toLowerCase(),
            wallet_address : req.query.wallet_addr.toLowerCase(),
            start_block : req.query.start_block === undefined ? null : req.query.start_block,
            end_block : req.query.end_block === undefined ? null : req.query.end_block,
            network_type : req.query.network_type === undefined ? 'mainnet' : req.query.network_type,
        }
        const found_tx_list = await web3Control.getEthTransactionList(queryInfo)        
        ret_data = {
            'status' : found_tx_list === -1 ? '0' : '1',
            "message" : found_tx_list === -1 ? 'Fail to get blc transaction_list' : '',
            'result' : found_tx_list === -1 ? '' : found_tx_list,
        }
    }
    catch {
        ret_data = {
            'status' : '0',
            "message": 'Fail to get eth transaction_list',
            'result' : {
                'transaction_list' : []
            } 
        }        
    }
    res.send(ret_data)
});


router.get('/transaction_list/blc/', async (req, res) => {
    let ret_data
    try {
        const queryInfo = {
            api_version : req.query.api_version.toLowerCase(),
            contract_address : req.query.contract_addr.toLowerCase(),
            wallet_address : req.query.wallet_addr.toLowerCase(),
            start_block : req.query.start_block === undefined ? null : req.query.start_block,
            end_block : req.query.end_block === undefined ? null : req.query.end_block,
            network_type : req.query.network_type === undefined ? 'mainnet' : req.query.network_type,
        }
        const found_tx_list = await web3Control.getBlcTransactionList(queryInfo)        
        ret_data = {
            'status' : found_tx_list === -1 ? '0' : '1',
            "message" : found_tx_list === -1 ? 'Fail to get blc transaction_list' : '',
            'result' : found_tx_list === -1 ? '' : found_tx_list,
        }
    }
    catch {
        ret_data = {
            'status' : '0',
            "message": 'Fail to get blc transaction_list',
            'result' : {
                'transaction_list' : []
            } 
        }        
    }
    res.send(ret_data)
});


module.exports = router;
