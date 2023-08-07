export const contractAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
export const abi = [
    {
        inputs: [
            {
                internalType: "address",
                name: "priceFeed",
                type: "address"
            }
        ],
        stateMutability: "nonpayable",
        type: "constructor"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "string",
                name: "order_id",
                type: "string"
            }
        ],
        name: "CreateOrderEvent",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "string",
                name: "order_id",
                type: "string"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "totalCostETH",
                type: "uint256"
            }
        ],
        name: "FundEvent",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "remainBalance",
                type: "uint256"
            }
        ],
        name: "RepayEvent",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "remainBalance",
                type: "uint256"
            }
        ],
        name: "WithdrawEvent",
        type: "event"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_usd",
                type: "uint256"
            }
        ],
        name: "USDtoWEI",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "_order_id",
                type: "string"
            },
            {
                internalType: "uint256",
                name: "_totalCostUSD",
                type: "uint256"
            }
        ],
        name: "createOrder",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "_order_id",
                type: "string"
            }
        ],
        name: "deleteOrder",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "orderId",
                type: "string"
            }
        ],
        name: "deleteOrderId",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "_order_id",
                type: "string"
            }
        ],
        name: "fund",
        outputs: [],
        stateMutability: "payable",
        type: "function"
    },
    {
        inputs: [],
        name: "getPriceETH",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "",
                type: "string"
            }
        ],
        name: "orderById",
        outputs: [
            {
                internalType: "string",
                name: "order_id",
                type: "string"
            },
            {
                internalType: "address",
                name: "customerAddress",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "totalCostUSD",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "totalCostETH",
                type: "uint256"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "owner",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "_order_id",
                type: "string"
            }
        ],
        name: "repay",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "_order_id",
                type: "string"
            }
        ],
        name: "retrieveTotalCost",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "viewAllOrder",
        outputs: [
            {
                components: [
                    {
                        internalType: "string",
                        name: "order_id",
                        type: "string"
                    },
                    {
                        internalType: "address",
                        name: "customerAddress",
                        type: "address"
                    },
                    {
                        internalType: "uint256",
                        name: "totalCostUSD",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "totalCostETH",
                        type: "uint256"
                    }
                ],
                internalType: "struct KavanoOrders.Order[]",
                name: "",
                type: "tuple[]"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "viewBalance",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "_order_id",
                type: "string"
            }
        ],
        name: "withdraw",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }
]