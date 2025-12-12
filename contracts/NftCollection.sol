// SPDX-License-Identifier: MIT
pragma solidity ^0.8.31;

interface IERC721Receiver {
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4);
}

contract NftCollection {
    // Token metadata
    string public name = "NFT Collection";
    string public symbol = "NFTC";
    uint256 public maxSupply = 10000;
    uint256 public totalSupply = 0;
    
    // Base URI for metadata
    string public baseURI = "ipfs://";
    
    // Access control
    address public owner;
    bool public paused = false;
    
    // Mappings
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _approvals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;
    mapping(uint256 => string) private _tokenURIs;
    
    // Events
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    event Paused(bool isPaused);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }
    
    // Constructor
    constructor() {
        owner = msg.sender;
    }
    
    // ERC-721 Functions
    
    function balanceOf(address account) public view returns (uint256) {
        require(account != address(0), "Invalid address");
        return _balances[account];
    }
    
    function ownerOf(uint256 tokenId) public view returns (address) {
        address owner_addr = _owners[tokenId];
        require(owner_addr != address(0), "Token does not exist");
        return owner_addr;
    }
    
    function mint(address to, uint256 tokenId) public onlyOwner whenNotPaused {
        require(to != address(0), "Cannot mint to zero address");
        require(_owners[tokenId] == address(0), "Token already exists");
        require(totalSupply < maxSupply, "Max supply exceeded");
        require(tokenId > 0 && tokenId <= maxSupply, "Invalid token ID");
        
        _owners[tokenId] = to;
        _balances[to] += 1;
        totalSupply += 1;
        
        emit Transfer(address(0), to, tokenId);
    }
    
    function safeMint(address to, uint256 tokenId) public onlyOwner whenNotPaused {
        mint(to, tokenId);
        _checkOnERC721Received(address(0), to, tokenId, "");
    }
    
    function burn(uint256 tokenId) public {
        address owner_addr = ownerOf(tokenId);
        require(msg.sender == owner_addr, "Only owner can burn");
        
        _balances[owner_addr] -= 1;
        delete _owners[tokenId];
        delete _approvals[tokenId];
        totalSupply -= 1;
        
        emit Transfer(owner_addr, address(0), tokenId);
    }
    
    function transfer(address to, uint256 tokenId) public {
        transferFrom(msg.sender, to, tokenId);
    }
    
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public {
        require(from != address(0), "Invalid from address");
        require(to != address(0), "Invalid to address");
        require(ownerOf(tokenId) == from, "From is not token owner");
        require(
            msg.sender == from || msg.sender == _approvals[tokenId] || _operatorApprovals[from][msg.sender],
            "Not approved to transfer"
        );
        
        _approvals[tokenId] = address(0);
        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;
        
        emit Transfer(from, to, tokenId);
    }
    
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public {
        safeTransferFrom(from, to, tokenId, "");
    }
    
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public {
        transferFrom(from, to, tokenId);
        _checkOnERC721Received(from, to, tokenId, data);
    }
    
    function approve(address to, uint256 tokenId) public {
        address owner_addr = ownerOf(tokenId);
        require(msg.sender == owner_addr || _operatorApprovals[owner_addr][msg.sender], "Not authorized");
        
        _approvals[tokenId] = to;
        emit Approval(owner_addr, to, tokenId);
    }
    
    function setApprovalForAll(address operator, bool approved) public {
        require(operator != msg.sender, "Cannot approve yourself");
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }
    
    function getApproved(uint256 tokenId) public view returns (address) {
        require(_owners[tokenId] != address(0), "Token does not exist");
        return _approvals[tokenId];
    }
    
    function isApprovedForAll(address owner_addr, address operator) public view returns (bool) {
        return _operatorApprovals[owner_addr][operator];
    }
    
    // Metadata
    function tokenURI(uint256 tokenId) public view returns (string memory) {
        require(_owners[tokenId] != address(0), "Token does not exist");
        
        if (bytes(_tokenURIs[tokenId]).length > 0) {
            return _tokenURIs[tokenId];
        }
        
        return string(abi.encodePacked(baseURI, _uint2str(tokenId)));
    }
    
    function setTokenURI(uint256 tokenId, string memory uri) public onlyOwner {
        require(_owners[tokenId] != address(0), "Token does not exist");
        _tokenURIs[tokenId] = uri;
    }
    
    function setBaseURI(string memory uri) public onlyOwner {
        baseURI = uri;
    }
    
    // Pause/Unpause
    function pause() public onlyOwner {
        paused = true;
        emit Paused(true);
    }
    
    function unpause() public onlyOwner {
        paused = false;
        emit Paused(false);
    }
    
    // Internal functions
    function _checkOnERC721Received(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) internal {
        if (_isContract(to)) {
            try IERC721Receiver(to).onERC721Received(msg.sender, from, tokenId, data) returns (bytes4 retval) {
                require(retval == IERC721Receiver.onERC721Received.selector, "Invalid ERC721Receiver");
            } catch {
                require(false, "ERC721Receiver error");
            }
        }
    }
    
    function _isContract(address addr) internal view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(addr)
        }
        return size > 0;
    }
    
    function _uint2str(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
    
    // Supportsinterface (basic ERC165)
    function supportsInterface(bytes4 interfaceId) public pure returns (bool) {
        return interfaceId == 0x80ac58cd || interfaceId == 0x01ffc9a7;
    }
}
