const Web3 = require('web3');  
const web3 = new Web3();
const axios = require('axios');

const config = require('../../config/config.json');

let etherScanApiKey;
let providerString;

module.exports.InitializeWeb3 = () => {	
    const networkType = config.data.web3.networkType
	if (networkType == "ropsten") {
		if (config.data.web3.provideVendor == "ehterScan") {
			providerString = config.data.etherScan.providerRopsten + config.data.infura.apiKey;
		} else if (config.data.web3.provideVendor == "infura") {
			providerString = config.data.infura.providerRopsten + config.data.infura.apiKey;
		}
	} else if (networkType == "mainNet") {
		if (config.data.web3.provideVendor == "ehterScan") {
			providerString = config.data.etherScan.providerMainNet + config.data.infura.apiKey;
		} else if (config.data.web3.provideVendor == "infura") {
			providerString = config.data.infura.providerMainNet + config.data.infura.apiKey;
		}
    }
    etherScanApiKey = config.data.etherScan.apiKey;    
    web3.setProvider(new web3.providers.HttpProvider(providerString));

    console.log("----------------------------------------------------------------------------");	
    console.log("# Initialize web3 config");	
    console.log("----------------------------------------------------------------------------");	
    console.log(`network type [ ${networkType} ]`);
    console.log(`web3 provider [ ${config.data.web3.provideVendor} ]`);
    console.log(`web3 provider API string [ ${providerString} ]`);    
    console.log(`etherScan API key [ ${etherScanApiKey} ]`);
    console.log("----------------------------------------------------------------------------");		
}

module.exports.isValidAddress = (addr) => {
	return web3.utils.isAddress(addr);
}

module.exports.getCurrentBlock = async (queryInfo) => {
    const etherScanApiString = getEtherScanApiString(queryInfo.network_type)
    const requestStr = `${etherScanApiString}?module=proxy&action=eth_blockNumber&apikey=${etherScanApiKey}`
    try {
        const response =  await axios.get(requestStr)
        return response.data.result
    } catch (error) {
        console.error(error)
        return -1
    }
}


module.exports.getBalance = async (queryInfo) => {
    const etherScanApiString = getEtherScanApiString(queryInfo.network_type)
    let requestStr
    if (queryInfo.contract_address === null) {
        requestStr = `${etherScanApiString}?module=account&action=balance&address=${queryInfo.wallet_address}&tag=latest&apikey=${etherScanApiKey}`
    } else {
        requestStr = `${etherScanApiString}?module=account&action=tokenbalance&contractaddress=${queryInfo.contract_address}&address=${queryInfo.wallet_address}&tag=latest&apikey=${etherScanApiKey}`
    }

    try {
        const response =  await axios.get(requestStr)
        return web3.utils.fromWei(response.data.result.toString(), 'ether');
    } catch (error) {
        console.error(error)
        return -1
    }
}

module.exports.getIcoWhitelist = async (queryInfo) => {
    let response
    let ret_data = {
        'whitelist': []
    }

    try {
        const found_contract = new web3.eth.Contract(queryInfo.ico_abi, queryInfo.ico_address) 	
        if (queryInfo.wallet_address === null) {
            // ret_data.whitelist = await found_contract.methods.getWhitelist().call()
            return ret_data
        } else {
            response = await found_contract.methods.isWhitelisted(queryInfo.wallet_address).call()
            response === true ? response =  '1' : response =  '0' 
            return response
        }
    }
    catch (error) {
        console.error(error)
        return -1
    }
}


module.exports.getUserInvesteEth = async (queryInfo) => {
    let eth_amount = 0
    try {
        const foundEthTransactionList =  await fetchEthTransaction( queryInfo.wallet_address,
                                                                                                        queryInfo.start_block,  
                                                                                                        queryInfo.end_block,
                                                                                                        queryInfo.network_type)        
        if (foundEthTransactionList.data.status === '1') {
            foundEthTransactionList.data.result.map(item => {
                if (item.txreceipt_status === '1' && item.value !== '0'
                    && (item.from === queryInfo.wallet_address && item.to === queryInfo.ico_address)) {
                        eth_amount += parseFloat(item.value);
                }
            })
            return web3.utils.fromWei(eth_amount.toString(), 'ether');
        }
        else {
            return -1
        }        
    } 
    catch (error) {
        console.error(error)
        return -1
    }
}


module.exports.getIcoInvestedEth = async (queryInfo) => {
    let eth_amount = 0
    try {        
        const foundEthTransactionList =  await fetchEthTransaction( queryInfo.ico_address,
                                                                                                        queryInfo.start_block,  
                                                                                                        queryInfo.end_block,
                                                                                                        queryInfo.network_type)
        if (foundEthTransactionList.data.status === '1') {
            foundEthTransactionList.data.result.map(item => {
                if (item.txreceipt_status === '1' && item.value !== '0'
                    && item.from !== queryInfo.owner_address && item.to === queryInfo.ico_address) {
                        eth_amount += parseFloat(item.value);
                }
            })
        }
        else {
            return -1
        }
        return web3.utils.fromWei(eth_amount.toString(), 'ether');
    } 
    catch (error) {
        console.error(error)
        return -1
    }
}

module.exports.getUserDistributedBlc = async (queryInfo) => {
    let blc_amount = 0
    try {
        const foundBlcTransactionList =  await fetchBlcTransaction(queryInfo.wallet_address, 
                                                                                                        queryInfo.contract_address, 
                                                                                                        queryInfo.start_block, 
                                                                                                        queryInfo.end_block,
                                                                                                        queryInfo.network_type)
        if (foundBlcTransactionList.data.status === '1') {
            foundBlcTransactionList.data.result.map(item => {
                if (item.value !== '0'
                    && (item.from === queryInfo.ico_address && item.to === queryInfo.wallet_address)) {
                        blc_amount += parseFloat(web3.utils.fromWei(item.value, 'ether'))
                        console.log(blc_amount)
                }
            })
            return blc_amount.toString();
        }
        else {
            return -1
        }        
    } 
    catch (error) {
        console.error(error)
        return -1
    }
}

module.exports.getIcoDistributeBlc = async (queryInfo) => {
    let blc_amount = 0
    try {
        const foundBlcTransactionList =  await fetchBlcTransaction(queryInfo.ico_address, 
                                                                                                        queryInfo.contract_address, 
                                                                                                        queryInfo.start_block, 
                                                                                                        queryInfo.end_block,
                                                                                                        queryInfo.network_type)
        if (foundBlcTransactionList.data.status === '1') {
            foundBlcTransactionList.data.result.map(item => {
                if (item.value !== '0' && item.from === queryInfo.ico_address && item.to !== queryInfo.owner_address) {
                    blc_amount += parseFloat(web3.utils.fromWei(item.value, 'ether'))
                }
            })
        }
        else {
            return -1
        } 
        return blc_amount.toString();
    } 
    catch (error) {
        console.error(error)
        return -1
    }
}


module.exports.getIcoTransactionList = async (queryInfo) => {
    let ret_data = {
        'eth_amount' : '',
        'blc_amount' : '',
        'transaction_list': [
        ]
    }
    let investedEth = 0
    let distributedBlc = 0
    try {
        const foundEthTransactionList =  await fetchEthTransaction( queryInfo.wallet_address === null ? 
                                                                                                        queryInfo.ico_address : queryInfo.wallet_address,
                                                                                                        queryInfo.start_block,  
                                                                                                        queryInfo.end_block,
                                                                                                        queryInfo.network_type)
        if (foundEthTransactionList.data.status === '1') {
            foundEthTransactionList.data.result.map(item => {
                if (item.value !== '0' &&
                    (queryInfo.wallet_address === null ? 
                        (item.from !== queryInfo.owner_address &&  item.to === queryInfo.ico_address)
                    :
                        ((item.from === queryInfo.wallet_address &&  item.to === queryInfo.ico_address)
                        || (item.from === queryInfo.wallet_address &&  item.to === queryInfo.owner_address)))
                ) {                    
                    ret_data.transaction_list.push({
                        'symbol' : 'ETH',
                        'receipt_status' : item.txreceipt_status,
                        'block_height' : item.blockNumber,
                        'time_stamp' : item.timeStamp,
                        'direction' : queryInfo.wallet_address === null ? 'in' : 'out',
                        'value' : web3.utils.fromWei(item.value, 'ether'),
                        'from' : item.from,
                        'to' : item.to,
                        'gas_used' : item.gasUsed,
                        'input' : item.input,
                        'confirmations' : item.confirmations,
                        'txid' : item.hash,
                    })
                    if (item.txreceipt_status === '1') {
                        investedEth += parseFloat(item.value, 'ether');
                    }
                }
            })
            ret_data.eth_amount = web3.utils.fromWei(investedEth.toString(), 'ether');
        } else {
            return -1
        }

        const foundBlcTransactionList =  await fetchBlcTransaction(queryInfo.wallet_address === null ?
                                                                                                        queryInfo.ico_address : queryInfo.wallet_address, 
                                                                                                        queryInfo.contract_address, 
                                                                                                        queryInfo.start_block, 
                                                                                                        queryInfo.end_block,
                                                                                                        queryInfo.network_type)                
        if (foundBlcTransactionList.data.status === '1') {
            foundBlcTransactionList.data.result.map(item => {
                if (item.value !== '0' &&
                    (queryInfo.wallet_address === null ? 
                        ((item.from === queryInfo.ico_address && item.to !== queryInfo.owner_address)
                        || (item.from === queryInfo.owner_address && item.to !== queryInfo.ico_address))
                     :
                        ((item.from === queryInfo.ico_address  && item.to === queryInfo.wallet_address)
                        || (item.from === queryInfo.owner_address  && item.to === queryInfo.wallet_address)))
                ) {
                    ret_data.transaction_list.push({
                        'symbol' : 'BLC',
                        'receipt_status' : '1',
                        'block_height' : item.blockNumber,
                        'time_stamp' : item.timeStamp,
                        'direction' : queryInfo.wallet_address === null ? 'out' : 'in',
                        'value' : web3.utils.fromWei(item.value, 'ether'),
                        'from' : item.from,
                        'to' : item.to,
                        'gas_used' : item.gasUsed,
                        'input' : item.input,
                        'confirmations' : item.confirmations,
                        'txid' : item.hash,
                    })                    
                    tem = parseFloat(web3.utils.fromWei(item.value, 'ether'))
                    distributedBlc += tem
                }
            })
            ret_data.blc_amount = distributedBlc.toString()
        }
        else {
            return -1
        }

        // list sorting
        ret_data.transaction_list = Object.keys(ret_data.transaction_list).map(function (key) {
            return ret_data.transaction_list[key];
        }).sort(function (itemA, itemB) {
            return itemA.time_stamp < itemB.time_stamp;
        });
        return ret_data
    } 
    catch (error) {
        console.error(error)
        return -1
    }
}


module.exports.getInternalTransactionList = async (queryInfo) => {
    let ret_data = {
        'transaction_list': [
        ]
    }

    try {
        const foundTokenSystemTransactionList =  await fetchEthTransaction(queryInfo.owner_address,
                                                                                                                        queryInfo.start_block,  
                                                                                                                        queryInfo.end_block,
                                                                                                                        queryInfo.network_type)
        if (foundTokenSystemTransactionList.data.status === '1') {
            foundTokenSystemTransactionList.data.result.map(item => {
                if (item.value === '0'
                    && ((item.from === queryInfo.owner_address &&  item.to === queryInfo.contract_address)
                    || (item.from === queryInfo.owner_address &&  item.to === '' && item.contractAddress === queryInfo.contract_address))) {
                        ret_data.transaction_list.push({
                            'command_type' : 'token',
                            'receipt_status' : item.txreceipt_status,
                            'block_height' : item.blockNumber,
                            'time_stamp' : item.timeStamp,
                            'from' : item.from,
                            'to' : item.to,
                            'gas_used' : item.gasUsed,
                            'input' : item.input,
                            'confirmations' : item.confirmations,
                            'txid' : item.hash,
                        })
                }
            })
        } else {
            return -1
        }

        const foundIcoSystemTransactionList =  await fetchEthTransaction(queryInfo.owner_address,
                                                                                                                    queryInfo.start_block,  
                                                                                                                    queryInfo.end_block,
                                                                                                                    queryInfo.network_type)
        if (foundIcoSystemTransactionList.data.status === '1') {
            foundIcoSystemTransactionList.data.result.map(item => {
                if (item.value === '0'
                    && ((item.from === queryInfo.owner_address && item.to === queryInfo.ico_address)
                    || (item.from === queryInfo.owner_address &&  item.to === '' && item.contractAddress === queryInfo.ico_address))) {
                        ret_data.transaction_list.push({
                            'command_type' : 'ico',
                            'receipt_status' : item.txreceipt_status,
                            'block_height' : item.blockNumber,
                            'time_stamp' : item.timeStamp,
                            'from' : item.from,
                            'to' : item.to,
                            'gas_used' : item.gasUsed,
                            'input' : item.input,
                            'confirmations' : item.confirmations,
                            'txid' : item.hash,
                        })
                }
            })
        } else {
            return -1
        }

        // list sorting
        ret_data.transaction_list = Object.keys(ret_data.transaction_list).map(function (key) {
            return ret_data.transaction_list[key];
        }).sort(function (itemA, itemB) {
            return itemA.time_stamp < itemB.time_stamp;
        });
        return ret_data
    } 
    catch (error) {
        console.error(error)
        return -1
    }
}


module.exports.getTransactionList = async (queryInfo) => {
    let ret_data = {
        'transaction_list': [
        ]
    }

    try {
        const foundEthTransactionList =  await fetchEthTransaction(queryInfo.wallet_address,
                                                                                                        queryInfo.start_block,  
                                                                                                        queryInfo.end_block,
                                                                                                        queryInfo.network_type)
        if (foundEthTransactionList.data.status === '1') {
            foundEthTransactionList.data.result.map(item => {
                ret_data.transaction_list.push({
                    'symbol' : 'ETH',
                    'receipt_status' : item.txreceipt_status,
                    'block_height' : item.blockNumber,
                    'time_stamp' : item.timeStamp,
                    'direction' : item.to === queryInfo.wallet_address ? 'in' : 'out',
                    'value' : web3.utils.fromWei(item.value, 'ether'),
                    'from' : item.from,
                    'to' : item.to,
                    'gas_used' : item.gasUsed,
                    'input' : item.input,
                    'confirmations' : item.confirmations,
                    'txid' : item.hash,
                })
            })
        }
        else {
            return -1
        }
        
        const foundBlcTransactionList =  await fetchBlcTransaction(queryInfo.wallet_address,
                                                                                                        queryInfo.contract_address, 
                                                                                                        queryInfo.start_block, 
                                                                                                        queryInfo.end_block,
                                                                                                        queryInfo.network_type)
        if (foundBlcTransactionList.data.status === '1') {
            foundBlcTransactionList.data.result.map(item => {
                ret_data.transaction_list.push({
                    'symbol' : 'BLC',
                    'receipt_status' : '1',
                    'block_height' : item.blockNumber,
                    'time_stamp' : item.timeStamp,
                    'direction' : item.to === queryInfo.wallet_address ? 'in' : 'out',
                    'value' : web3.utils.fromWei(item.value, 'ether'),
                    'from' : item.from,
                    'to' : item.to,
                    'gas_used' : item.gasUsed,
                    'input' : item.input,
                    'confirmations' : item.confirmations,
                    'txid' : item.hash,
                })       
            })

            // list sorting
            ret_data.transaction_list = Object.keys(ret_data.transaction_list).map(function (key) {
                return ret_data.transaction_list[key];
            }).sort(function (itemA, itemB) {
                return itemA.time_stamp < itemB.time_stamp;
            });
        }
        else {
            return -1
        }
        return ret_data
    } 
    catch (error) {
        console.error(error)
        return -1
    }
}


module.exports.getEthTransactionList = async (queryInfo) => {
    let ret_data = {
        'transaction_list': [
        ]
    }

    try {
        const foundEthTransactionList =  await fetchEthTransaction(queryInfo.wallet_address,
                                                                                                        queryInfo.start_block,  
                                                                                                        queryInfo.end_block,
                                                                                                        queryInfo.network_type)
        if (foundEthTransactionList.data.status === '1') {
            foundEthTransactionList.data.result.map(item => {
                ret_data.transaction_list.push({
                    'symbol' : 'ETH',
                    'receipt_status' : item.txreceipt_status,
                    'block_height' : item.blockNumber,
                    'time_stamp' : item.timeStamp,
                    'direction' : item.to === queryInfo.wallet_address ? 'in' : 'out',
                    'value' : web3.utils.fromWei(item.value, 'ether'),
                    'from' : item.from,
                    'to' : item.to,
                    'gas_used' : item.gasUsed,
                    'input' : item.input,
                    'confirmations' : item.confirmations,
                    'txid' : item.hash,
                })
            })
        }
        else {
            return -1
        }        
        // list sorting
        ret_data.transaction_list = Object.keys(ret_data.transaction_list).map(function (key) {
            return ret_data.transaction_list[key];
        }).sort(function (itemA, itemB) {
            return itemA.time_stamp < itemB.time_stamp;
        });
        return ret_data
    } 
    catch (error) {
        console.error(error)
        return -1
    }
}

module.exports.getBlcTransactionList = async (queryInfo) => {
    let ret_data = {
        'transaction_list': [
        ]
    } 

    try {      
        const foundBlcTransactionList =  await fetchBlcTransaction(queryInfo.wallet_address,
                                                                                                        queryInfo.contract_address, 
                                                                                                        queryInfo.start_block, 
                                                                                                        queryInfo.end_block,
                                                                                                        queryInfo.network_type)
        if (foundBlcTransactionList.data.status === '1') {
            foundBlcTransactionList.data.result.map(item => {
                ret_data.transaction_list.push({
                    'symbol' : 'BLC',
                    // 'receipt_status' : item.txreceipt_status,
                    'receipt_status' : '1',
                    'block_height' : item.blockNumber,
                    'time_stamp' : item.timeStamp,
                    'direction' : item.to === queryInfo.wallet_address ? 'in' : 'out',
                    'value' : web3.utils.fromWei(item.value, 'ether'),
                    'from' : item.from,
                    'to' : item.to,
                    'gas_used' : item.gasUsed,
                    'input' : item.input,
                    'confirmations' : item.confirmations,
                    'txid' : item.hash,
                })       
            })
        }
        else {
            return -1
        }
        // list sorting
        ret_data.transaction_list = Object.keys(ret_data.transaction_list).map(function (key) {
            return ret_data.transaction_list[key];
        }).sort(function (itemA, itemB) {
            return itemA.time_stamp < itemB.time_stamp;
        });
        return ret_data
    } 
    catch (error) {
        console.error(error)
        return -1
    }
}


fetchEthTransaction = async (wallet_address, start_block, end_block, network_type) => {
    const etherScanApiString = getEtherScanApiString(network_type)
    const wallet_address_string = wallet_address === null ? '' : `&address=${wallet_address}`
    const start_block_string = start_block === null ? '' : `&startblock=${start_block}`
    const end_block_string = end_block === null ? '' : `&endblock=${end_block}`
    const requestStr = `${etherScanApiString}?module=account&action=txlist${wallet_address_string}${start_block_string}${end_block_string}&sort=asc&apikey=${etherScanApiKey}`

    try {
        return await axios.get(requestStr)
    } 
    catch (error) {
        console.error(error)
        return -1
    }
}


fetchBlcTransaction = async (wallet_address, contract_address, start_block, end_block, network_type) => {
    const etherScanApiString = getEtherScanApiString(network_type)
    const contract_address_string = `&contractaddress=${contract_address}`
    const wallet_address_string = wallet_address === null ? '' : `&address=${wallet_address}`
    const start_block_string = start_block === null ? '' : `&startblock=${start_block}`
    const end_block_string = end_block === null ? '' : `&endblock=${end_block}`
    const requestStr = `${etherScanApiString}?module=account&action=tokentx${contract_address_string}${wallet_address_string}${start_block_string}${end_block_string}&sort=asc&apikey=${etherScanApiKey}`

    try {
        return await axios.get(requestStr)
    } 
    catch (error) {
        console.error(error)
        return -1
    }
}

getEtherScanApiString = (network_type) => {
    if (network_type == "mainnet") {
		return config.data.etherScan.providerMainNet
    } else if (network_type == "ropsten") {
        return config.data.etherScan.providerRopsten
    }
}