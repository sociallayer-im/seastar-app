export interface PaymentSettingChain {
    chain: string,
    id: string,
    chainId: number,
    icon: string,
    payHub: string,
    tokenList: PaymentSettingToken[]
}

export interface PaymentSettingToken {
    name: string,
    id: string,
    contract: string,
    icon: string,
    decimals: number
}

export const paymentTokenList: PaymentSettingChain[] = [
    {
        chain: 'Polygon',
        id: 'polygon',
        chainId: 137,
        icon: '/images/payment_icon/polygon.svg',
        payHub: '0xA73405D59e136f574a2FD690079B240f6fbff0a8',
        tokenList: [
            {
                name: 'USDT',
                id: 'usdt',
                contract: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
                icon: '/images/tether_32.webp',
                decimals: 6
            },
            {
                name: 'USDC',
                id: 'usdc',
                contract: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
                icon: '/images/usdc_32.webp',
                decimals: 6
            }
        ]
    },
    {
        chain: 'Optimism',
        id: 'optimism',
        chainId: 10,
        icon: '/images/payment_icon/op.png',
        payHub: '0xA73405D59e136f574a2FD690079B240f6fbff0a8',
        tokenList: [
            {
                name: 'USDT',
                id: 'usdt',
                contract: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
                icon: '/images/payment_icon/tether_32.webp',
                decimals: 6
            }
        ]
    },
    {
        chain: 'Arbitrum',
        id: 'arbitrum',
        chainId: 42161,
        icon: '/images/payment_icon/arbitrum.png',
        payHub: '0xA73405D59e136f574a2FD690079B240f6fbff0a8',
        tokenList: [
            {
                name: 'USDT',
                id: 'usdt',
                contract: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
                icon: '/images/payment_icon/tether_32.webp',
                decimals: 6
            }
        ]

    },
    {
        chain: 'Base',
        id: 'base',
        chainId: 8453,
        icon: '/images/payment_icon/base_chain.png',
        payHub: '0xA73405D59e136f574a2FD690079B240f6fbff0a8',
        tokenList: [
            {
                name: 'USDC',
                id: 'usdc',
                contract: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
                icon: '/images/payment_icon/usdc_32.webp',
                decimals: 6
            }
        ]

    },
    {
        chain: "Ethereum",
        id: 'ethereum',
        chainId: 1,
        icon: '/images/payment_icon/ethereum-icon.webp',
        payHub: '0xa17DA9562a4331669Fd2FBb9c607c409Ae190957',
        tokenList: [
            {
                name: 'USDT',
                id: 'usdt',
                contract: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
                icon: '/images/payment_icon/tether_32.webp',
                decimals: 6
            }
        ]
    },
    {
        chain: 'Daimo(OP)',
        id: 'daimo',
        chainId: 0,
        icon: '/images/payment_icon/daimo.jpg',
        payHub: '',
        tokenList: [
            // op chain
            {
                name: 'USDT',
                id: 'usdt',
                contract: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
                icon: '/images/payment_icon/tether_32.webp',
                decimals: 6
            }
        ]
    },
    {
        chain: 'Stripe',
        id: 'stripe',
        chainId: 0,
        icon: '/images/payment_icon/stripe.png',
        payHub: '',
        tokenList: [
            {
                name: 'USD',
                id: 'usd',
                contract: '',
                icon: '/images/payment_icon/usd.png',
                decimals: 2
            }
        ]
    }
] // development


export const erc20_abi = [{
    type: 'event',
    name: 'Approval',
    inputs: [
        {
            indexed: true,
            name: 'owner',
            type: 'address',
        },
        {
            indexed: true,
            name: 'spender',
            type: 'address',
        },
        {
            indexed: false,
            name: 'value',
            type: 'uint256',
        },
    ],
},
{
    type: 'event',
    name: 'Transfer',
    inputs: [
        {
            indexed: true,
            name: 'from',
            type: 'address',
        },
        {
            indexed: true,
            name: 'to',
            type: 'address',
        },
        {
            indexed: false,
            name: 'value',
            type: 'uint256',
        },
    ],
},
{
    type: 'function',
    name: 'allowance',
    stateMutability: 'view',
    inputs: [
        {
            name: 'owner',
            type: 'address',
        },
        {
            name: 'spender',
            type: 'address',
        },
    ],
    outputs: [
        {
            name: '',
            type: 'uint256',
        },
    ],
},
{
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
        {
            name: 'spender',
            type: 'address',
        },
        {
            name: 'amount',
            type: 'uint256',
        },
    ],
    outputs: [],
},
{
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [
        {
            name: 'account',
            type: 'address',
        },
    ],
    outputs: [
        {
            name: '',
            type: 'uint256',
        },
    ],
},
{
    type: 'function',
    name: 'decimals',
    stateMutability: 'view',
    inputs: [],
    outputs: [
        {
            name: '',
            type: 'uint8',
        },
    ],
},
{
    type: 'function',
    name: 'name',
    stateMutability: 'view',
    inputs: [],
    outputs: [
        {
            name: '',
            type: 'string',
        },
    ],
},
{
    type: 'function',
    name: 'symbol',
    stateMutability: 'view',
    inputs: [],
    outputs: [
        {
            name: '',
            type: 'string',
        },
    ],
},
{
    type: 'function',
    name: 'totalSupply',
    stateMutability: 'view',
    inputs: [],
    outputs: [
        {
            name: '',
            type: 'uint256',
        },
    ],
},
{
    type: 'function',
    name: 'transfer',
    stateMutability: 'nonpayable',
    inputs: [
        {
            name: 'recipient',
            type: 'address',
        },
        {
            name: 'amount',
            type: 'uint256',
        },
    ],
    outputs: [],
},
{
    type: 'function',
    name: 'transferFrom',
    stateMutability: 'nonpayable',
    inputs: [
        {
            name: 'sender',
            type: 'address',
        },
        {
            name: 'recipient',
            type: 'address',
        },
        {
            name: 'amount',
            type: 'uint256',
        },
    ],
    outputs: [
        {
            name: '',
            type: 'bool',
        },
    ],
},
]

export const payhub_abi = [{"inputs": [], "stateMutability": "nonpayable", "type": "constructor"}, {
    "anonymous": false,
    "inputs": [{
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
    }, {"indexed": true, "internalType": "address", "name": "newOwner", "type": "address"}],
    "name": "OwnershipTransferred",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": false, "internalType": "address", "name": "from", "type": "address"}, {
        "indexed": false,
        "internalType": "address",
        "name": "to",
        "type": "address"
    }, {"indexed": false, "internalType": "address", "name": "token", "type": "address"}, {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
    }, {"indexed": false, "internalType": "uint256", "name": "productId", "type": "uint256"}, {
        "indexed": false,
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
    }],
    "name": "PaymentTrasnfered",
    "type": "event"
}, {
    "inputs": [],
    "name": "owner",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [{"internalType": "address", "name": "to", "type": "address"}, {
        "internalType": "address",
        "name": "token",
        "type": "address"
    }, {"internalType": "uint256", "name": "amount", "type": "uint256"}, {
        "internalType": "uint256",
        "name": "productId",
        "type": "uint256"
    }, {"internalType": "uint256", "name": "itemId", "type": "uint256"}],
    "name": "transfer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [{"internalType": "address", "name": "newOwner", "type": "address"}],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}]

export function getChainIconById(chainId: string) {
    return paymentTokenList.find(chain => chain.id === chainId)?.icon
}

export interface PaymentsType {
    label: string,
    chain: string,
    id: string,
    protocol: string,
    chainId: number,
    protocolIcon: string,
    chainIcon: string,
    payHub: string,
    tokenList: PaymentSettingToken[]
}

export const Payments: PaymentsType[] = [
    {
        label: 'Daimo(OP)',
        chain: 'optimism',
        id: 'daimo_op',
        protocol: 'daimo',
        chainId: 42161,
        protocolIcon: '/images/payment_icon/daimo.jpg',
        chainIcon: '/images/payment_icon/op.png',
        payHub: '',
        tokenList: [
            // op chain
            {
                name: 'USDT',
                id: 'usdt',
                contract: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
                icon: '/images/payment_icon/tether_32.webp',
                decimals: 6
            }
        ]
    },
    {
        label: 'Daimo(Base)',
        chain: 'base',
        id: 'daimo_base',
        protocol: 'daimo',
        chainId: 8453,
        protocolIcon: '/images/payment_icon/daimo.jpg',
        chainIcon: '/images/payment_icon/base_chain.png',
        payHub: '',
        tokenList: [
            // base chain
            {
                name: 'USDC',
                id: 'usdc',
                contract: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
                icon: '/images/payment_icon/usdc_32.webp',
                decimals: 6
            }
        ]
    },
    {
        label: 'EVM(Polygon)',
        chain: 'polygon',
        id: 'evm-polygon',
        protocol: 'crypto',
        chainId: 137,
        protocolIcon: '/images/payment_icon/polygon.svg',
        chainIcon: '/images/payment_icon/polygon.svg',
        payHub: '0xA73405D59e136f574a2FD690079B240f6fbff0a8',
        tokenList: [
            {
                name: 'USDT',
                id: 'usdt',
                contract: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
                icon: '/images/payment_icon/tether_32.webp',
                decimals: 6
            },
            {
                name: 'USDC',
                id: 'usdc',
                contract: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
                icon: '/images/payment_icon/usdc_32.webp',
                decimals: 6
            }
        ]
    },
]


