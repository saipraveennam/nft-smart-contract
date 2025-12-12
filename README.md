# ERC-721 Compatible NFT Smart Contract

A comprehensive ERC-721 compatible NFT smart contract with automated test suite and Docker support.

## Overview

This project implements a fully functional NFT smart contract following the ERC-721 standard. It includes:

- **ERC-721 Compatible Implementation**: Standard-compliant NFT contract with all required functions and events
- **Minting & Burning**: Support for minting new tokens and burning existing tokens
- **Transfer Mechanisms**: Safe and unsafe transfers with approval management
- **Operator Approvals**: Allow operators to manage multiple tokens
- **Metadata Support**: Token URI management with both custom and base URI patterns
- **Access Control**: Owner-based access control for administrative functions
- **Pause/Unpause**: Contract pause functionality for emergency situations
- **Comprehensive Test Suite**: Over 40 test cases covering all functionality
- **Docker Support**: Complete containerization for easy testing and deployment

## Project Structure

```
project-root/
├── contracts/
│   └── NftCollection.sol       # Main ERC-721 implementation
├── test/
│   └── NftCollection.test.js   # Comprehensive test suite
├── package.json                 # Node.js dependencies
├── hardhat.config.js            # Hardhat configuration
├── Dockerfile                   # Docker container definition
├── .dockerignore                # Docker build exclusions
└── README.md                    # This file
```

## Features

### Core ERC-721 Functions
- `balanceOf(address)`: Get token balance of an address
- `ownerOf(uint256)`: Get owner of a specific token
- `mint(address, uint256)`: Mint new token (owner only)
- `safeMint(address, uint256)`: Safe mint with receiver callback
- `burn(uint256)`: Burn a token
- `transfer(address, uint256)`: Transfer token
- `transferFrom(address, address, uint256)`: Transfer with approval
- `safeTransferFrom(...)`: Safe transfer with callback
- `approve(address, uint256)`: Approve token transfer
- `setApprovalForAll(address, bool)`: Set operator approval
- `getApproved(uint256)`: Get approved address
- `isApprovedForAll(address, address)`: Check operator approval

### Metadata Functions
- `tokenURI(uint256)`: Get metadata URI for token
- `setTokenURI(uint256, string)`: Set custom URI for token
- `setBaseURI(string)`: Set base URI for all tokens

### Administrative Functions
- `pause()`: Pause minting (owner only)
- `unpause()`: Unpause minting (owner only)

## Requirements

- Node.js 18+ (for development)
- Docker (for containerized testing)
- npm or yarn

## Setup & Installation

### Local Development

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm test

# Run tests with gas report
npm run test:gas
```

### Using Docker

```bash
# Build the Docker image
docker build -t nft-contract .

# Run tests in Docker
docker run nft-contract
```

## Testing

The test suite includes comprehensive coverage of:

- **Initialization**: Contract setup and initial state
- **Minting**: Token creation with various scenarios
- **Transfers**: Token movement and ownership changes
- **Approvals**: Individual token and operator approvals
- **Burning**: Token removal and supply updates
- **Metadata**: URI management and token information
- **Pause/Unpause**: Emergency pause functionality
- **Gas Efficiency**: Verification of reasonable gas costs

### Running Tests

```bash
# Run all tests
npm test

# Run tests with gas reporter
REPORT_GAS=true npm test
```

## Contract Specifications

### Token Configuration
- **Name**: NFT Collection
- **Symbol**: NFTC
- **Max Supply**: 10,000 tokens
- **Token ID Range**: 1 to 10,000

### Security Features
- **Authorization**: Owner-only administrative functions
- **Input Validation**: All parameters validated before processing
- **Event Emission**: All state changes emit appropriate events
- **Atomic Operations**: State changes are atomic and consistent
- **Safe Transfers**: Receiver contract callbacks supported

## Gas Efficiency

The contract is optimized for gas efficiency:
- Minting: ~80,000 gas
- Transfer: ~60,000 gas
- Approval: ~50,000 gas

## Events

- `Transfer(from, to, tokenId)`: Emitted on mint, transfer, and burn
- `Approval(owner, approved, tokenId)`: Emitted on token approval
- `ApprovalForAll(owner, operator, approved)`: Emitted on operator approval
- `Paused(isPaused)`: Emitted on pause/unpause

## Error Handling

The contract provides clear revert messages for invalid operations:
- "Only owner can call this" - Unauthorized caller
- "Cannot mint to zero address" - Invalid recipient
- "Token already exists" - Duplicate minting
- "Max supply exceeded" - Supply limit reached
- "Invalid token ID" - Token ID out of range
- "Token does not exist" - Non-existent token reference
- "Not approved to transfer" - Insufficient permissions
- "Contract is paused" - Contract paused state

## Development Tools

- **Hardhat**: Smart contract development framework
- **Ethers.js**: Ethereum interaction library
- **Chai**: Assertion library for testing
- **Docker**: Containerization

## License

MIT License

## Author

Sai Praveen Nam
