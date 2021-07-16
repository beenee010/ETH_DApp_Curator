pragma solidity ^0.5.0;

import "@openzeppelin/contracts/GSN/Context.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";

contract Curator is Context, ERC20, ERC20Detailed, ERC20Burnable {

// _name: Curator
// owner: Contract Owner
// imageCount: Number of Image where in Blockchain Ledger (and IPFS)
// images: Image mapping to images
  string public _name;
  address payable public owner;
  uint public imageCount = 0;
  mapping(uint => Image) public images;

// Image
  struct Image {
    uint id;
    string hash;
    string description;
    uint tipAmount;
    address payable author;
  }

// create Image struct event
  event ImageCreated(
    uint id,
    string hash,
    string description,
    uint tipAmount,
    address payable author
  );

// Tip for Image struct event
  event ImageTip(
    uint id,
    string hash,
    string description,
    uint tipAmount,
    address payable author
  );

  constructor(address payable _owner) public ERC20Detailed("Curator", "CRT", 18) {
    _name = "Curator";
    owner = _owner;
    _mint(_msgSender(), 10000 * (10 ** uint256(decimals())));
  }

// Upload Image(Post) to contract struct
  function uploadImage(string memory _imgHash, string memory _description) public {
    require(bytes(_imgHash).length > 0);
    require(bytes(_description).length > 0);
    require(msg.sender!=address(0));

    imageCount ++;
    images[imageCount] = Image(imageCount, _imgHash, _description, 0, msg.sender);
    
    emit ImageCreated(imageCount, _imgHash, _description, 0, msg.sender);
  }

// Tip for Image(Post)
  function tipImageOwner(uint _id) public payable {
    require(_id > 0 && _id <= imageCount);
    Image memory _image = images[_id];

    uint256 tokenAmount = msg.value * (10 ** uint256(decimals()));

    address payable _author = _image.author;
    super._transfer(msg.sender, _author, tokenAmount);
    _image.tipAmount = _image.tipAmount + 1;
    images[_id] = _image;
    
    emit ImageTip(_id, _image.hash, _image.description, _image.tipAmount, _author);
  }

// Buy Token(CRT): ETH => CRT (1:1)
  function buyToken() public payable {
      uint256 tokenAmount = msg.value * (10 ** uint256(decimals()));
      require(msg.value > 0);
      
      super._mint(msg.sender, msg.value);
  }

// Sell Token(CRT): CRT => ETH (1:1)
  function sellToken() public payable {
      uint256 tokenAmount = msg.value * (10 ** uint256(decimals()));
      require(msg.value > 0 && this.balanceOf(msg.sender) >= tokenAmount);
      
      super.burn(tokenAmount);
      msg.sender.transfer(tokenAmount);
  }
}
