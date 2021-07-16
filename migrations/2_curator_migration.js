const Curator = artifacts.require("Curator");

module.exports = function(deployer, network, accounts) {
  var ownerAddress = accounts[0];
  console.log(accounts[0])
  deployer.deploy(Curator, ownerAddress);
};
