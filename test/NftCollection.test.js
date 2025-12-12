const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NftCollection", function () {
  let nft;
  let owner, addr1, addr2, addr3;

  beforeEach(async function () {
    const NftCollection = await ethers.getContractFactory("NftCollection");
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    nft = await NftCollection.deploy();
    await nft.deployed();
  });

  describe("Initialization", function () {
    it("Should have correct name and symbol", async function () {
      expect(await nft.name()).to.equal("NFT Collection");
      expect(await nft.symbol()).to.equal("NFTC");
    });

    it("Should have correct max supply", async function () {
      expect(await nft.maxSupply()).to.equal(10000);
    });

    it("Should have zero total supply initially", async function () {
      expect(await nft.totalSupply()).to.equal(0);
    });

    it("Should set owner correctly", async function () {
      expect(await nft.owner()).to.equal(owner.address);
    });

    it("Should not be paused initially", async function () {
      expect(await nft.paused()).to.equal(false);
    });
  });

  describe("Minting", function () {
    it("Should mint token successfully", async function () {
      await nft.mint(addr1.address, 1);
      expect(await nft.ownerOf(1)).to.equal(addr1.address);
      expect(await nft.balanceOf(addr1.address)).to.equal(1);
      expect(await nft.totalSupply()).to.equal(1);
    });

    it("Should emit Transfer event on mint", async function () {
      await expect(nft.mint(addr1.address, 1))
        .to.emit(nft, "Transfer")
        .withArgs(ethers.constants.AddressZero, addr1.address, 1);
    });

    it("Should revert if non-owner tries to mint", async function () {
      await expect(
        nft.connect(addr1).mint(addr1.address, 1)
      ).to.be.revertedWith("Only owner can call this");
    });

    it("Should revert when minting to zero address", async function () {
      await expect(
        nft.mint(ethers.constants.AddressZero, 1)
      ).to.be.revertedWith("Cannot mint to zero address");
    });

    it("Should revert when minting duplicate token", async function () {
      await nft.mint(addr1.address, 1);
      await expect(
        nft.mint(addr2.address, 1)
      ).to.be.revertedWith("Token already exists");
    });

    it("Should revert when minting beyond max supply", async function () {
      // Mint max supply worth of tokens
      for (let i = 1; i <= 10000; i++) {
        await nft.mint(addr1.address, i);
      }
      await expect(
        nft.mint(addr1.address, 10001)
      ).to.be.revertedWith("Max supply exceeded");
    });

    it("Should revert with invalid token ID", async function () {
      await expect(
        nft.mint(addr1.address, 0)
      ).to.be.revertedWith("Invalid token ID");
      
      await expect(
        nft.mint(addr1.address, 10001)
      ).to.be.revertedWith("Invalid token ID");
    });

    it("Should revert when contract is paused", async function () {
      await nft.pause();
      await expect(
        nft.mint(addr1.address, 1)
      ).to.be.revertedWith("Contract is paused");
    });
  });

  describe("Transfers", function () {
    beforeEach(async function () {
      await nft.mint(addr1.address, 1);
    });

    it("Should transfer token successfully", async function () {
      await nft.connect(addr1).transfer(addr2.address, 1);
      expect(await nft.ownerOf(1)).to.equal(addr2.address);
      expect(await nft.balanceOf(addr1.address)).to.equal(0);
      expect(await nft.balanceOf(addr2.address)).to.equal(1);
    });

    it("Should emit Transfer event", async function () {
      await expect(
        nft.connect(addr1).transfer(addr2.address, 1)
      ).to.emit(nft, "Transfer")
        .withArgs(addr1.address, addr2.address, 1);
    });

    it("Should revert transfer of non-existent token", async function () {
      await expect(
        nft.connect(addr1).transfer(addr2.address, 999)
      ).to.be.revertedWith("Token does not exist");
    });

    it("Should revert transfer to zero address", async function () {
      await expect(
        nft.connect(addr1).transfer(ethers.constants.AddressZero, 1)
      ).to.be.revertedWith("Invalid to address");
    });

    it("Should revert unauthorized transfer", async function () {
      await expect(
        nft.connect(addr2).transfer(addr3.address, 1)
      ).to.be.revertedWith("Not approved to transfer");
    });
  });

  describe("Approvals", function () {
    beforeEach(async function () {
      await nft.mint(addr1.address, 1);
    });

    it("Should approve token transfer", async function () {
      await nft.connect(addr1).approve(addr2.address, 1);
      expect(await nft.getApproved(1)).to.equal(addr2.address);
    });

    it("Should emit Approval event", async function () {
      await expect(
        nft.connect(addr1).approve(addr2.address, 1)
      ).to.emit(nft, "Approval")
        .withArgs(addr1.address, addr2.address, 1);
    });

    it("Should allow approved address to transfer", async function () {
      await nft.connect(addr1).approve(addr2.address, 1);
      await nft.connect(addr2).transferFrom(addr1.address, addr3.address, 1);
      expect(await nft.ownerOf(1)).to.equal(addr3.address);
    });

    it("Should clear approval on transfer", async function () {
      await nft.connect(addr1).approve(addr2.address, 1);
      await nft.connect(addr2).transferFrom(addr1.address, addr3.address, 1);
      expect(await nft.getApproved(1)).to.equal(ethers.constants.AddressZero);
    });

    it("Should set and revoke approval for all", async function () {
      await nft.connect(addr1).setApprovalForAll(addr2.address, true);
      expect(await nft.isApprovedForAll(addr1.address, addr2.address)).to.be.true;
      
      await nft.connect(addr1).setApprovalForAll(addr2.address, false);
      expect(await nft.isApprovedForAll(addr1.address, addr2.address)).to.be.false;
    });

    it("Should emit ApprovalForAll event", async function () {
      await expect(
        nft.connect(addr1).setApprovalForAll(addr2.address, true)
      ).to.emit(nft, "ApprovalForAll")
        .withArgs(addr1.address, addr2.address, true);
    });

    it("Should revert self-approval for all", async function () {
      await expect(
        nft.connect(addr1).setApprovalForAll(addr1.address, true)
      ).to.be.revertedWith("Cannot approve yourself");
    });
  });

  describe("Operator Approvals", function () {
    beforeEach(async function () {
      await nft.mint(addr1.address, 1);
      await nft.mint(addr1.address, 2);
    });

    it("Should allow operator to transfer multiple tokens", async function () {
      await nft.connect(addr1).setApprovalForAll(addr2.address, true);
      await nft.connect(addr2).transferFrom(addr1.address, addr3.address, 1);
      await nft.connect(addr2).transferFrom(addr1.address, addr3.address, 2);
      
      expect(await nft.balanceOf(addr1.address)).to.equal(0);
      expect(await nft.balanceOf(addr3.address)).to.equal(2);
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      await nft.mint(addr1.address, 1);
    });

    it("Should burn token successfully", async function () {
      await nft.connect(addr1).burn(1);
      expect(await nft.balanceOf(addr1.address)).to.equal(0);
      expect(await nft.totalSupply()).to.equal(0);
    });

    it("Should emit Transfer event on burn", async function () {
      await expect(
        nft.connect(addr1).burn(1)
      ).to.emit(nft, "Transfer")
        .withArgs(addr1.address, ethers.constants.AddressZero, 1);
    });

    it("Should revert if non-owner tries to burn", async function () {
      await expect(
        nft.connect(addr2).burn(1)
      ).to.be.revertedWith("Only owner can burn");
    });
  });

  describe("Metadata", function () {
    beforeEach(async function () {
      await nft.mint(addr1.address, 1);
    });

    it("Should return token URI", async function () {
      const uri = await nft.tokenURI(1);
      expect(uri).to.include("ipfs://1");
    });

    it("Should set custom token URI", async function () {
      await nft.setTokenURI(1, "https://example.com/1.json");
      expect(await nft.tokenURI(1)).to.equal("https://example.com/1.json");
    });

    it("Should set base URI", async function () {
      await nft.setBaseURI("https://example.com/");
      const uri = await nft.tokenURI(1);
      expect(uri).to.include("https://example.com/");
    });

    it("Should revert tokenURI for non-existent token", async function () {
      await expect(
        nft.tokenURI(999)
      ).to.be.revertedWith("Token does not exist");
    });
  });

  describe("Pause/Unpause", function () {
    it("Should pause minting", async function () {
      await nft.pause();
      expect(await nft.paused()).to.be.true;
      
      await expect(
        nft.mint(addr1.address, 1)
      ).to.be.revertedWith("Contract is paused");
    });

    it("Should unpause minting", async function () {
      await nft.pause();
      await nft.unpause();
      expect(await nft.paused()).to.be.false;
      
      await nft.mint(addr1.address, 1);
      expect(await nft.ownerOf(1)).to.equal(addr1.address);
    });

    it("Should emit Paused event", async function () {
      await expect(nft.pause())
        .to.emit(nft, "Paused")
        .withArgs(true);
      
      await expect(nft.unpause())
        .to.emit(nft, "Paused")
        .withArgs(false);
    });
  });

  describe("Gas efficiency", function () {
    it("Should mint within reasonable gas limits", async function () {
      const tx = await nft.mint(addr1.address, 1);
      const receipt = await tx.wait();
      expect(receipt.gasUsed).to.be.below(150000);
    });

    it("Should transfer within reasonable gas limits", async function () {
      await nft.mint(addr1.address, 1);
      const tx = await nft.connect(addr1).transfer(addr2.address, 1);
      const receipt = await tx.wait();
      expect(receipt.gasUsed).to.be.below(100000);
    });
  });
});
