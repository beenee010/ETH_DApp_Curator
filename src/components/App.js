import Curator from '../abis/Curator.json'
import React, { Component, useCallback } from 'react';
import Identicon from 'identicon.js';
import Navbar from './Navbar'
import Main from './Main'
import Web3 from 'web3';
import './App.css';
import { ThemeConsumer } from 'react-bootstrap/esm/ThemeProvider';

const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) // leaving out the arguments will default to these values
var web3 = null;
var accounts = null;
var networkId = null;
var networkData = null;
var curator = null;
class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  // Load web3 Library
  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  // Load post data from Blockchain Ledger
  async loadBlockchainData() {
    web3 = window.web3

    accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    networkId = await web3.eth.net.getId()
    networkData = Curator.networks[networkId]

    if(networkData) {
      curator = new web3.eth.Contract(Curator.abi, networkData.address)
      this.setState({ curator })
      const imagesCount = await curator.methods.imageCount().call()
      this.setState({ imagesCount })

      for (var i = 1; i <= imagesCount; i++) {
        const image = await curator.methods.images(i).call()
        this.setState({
          images: [...this.state.images, image]
        })
      }

      this.setState({
        images: this.state.images.sort((a,b) => b.tipAmount - a.tipAmount )
      })
      this.setState({ loading: false})
    } else {
      window.alert('Curator contract not deployed to detected network.')
    }
  }

  // file read
  captureFile = event => {

    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)

    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
      console.log('buffer', this.state.buffer)
    }
  }

  // adding file to IPFS
  uploadImage = description => {
    console.log("Submitting file to ipfs...")


    ipfs.add(this.state.buffer, (error, result) => {
      console.log('Ipfs result', result)
      if(error) {
        console.error(error)
        return
      }

      this.setState({ loading: true })
      this.state.curator.methods.uploadImage(result[0].hash, description).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  // tip Token(CRT) to post author
  async tipImageOwner(id, author, tipAmount) {
    this.setState({ loading: true })
    this.setState({ curator })

    if(networkData) {
      this.state.curator.methods.tipImageOwner(id).send({ from: this.state.account, value: tipAmount})
      this.setState({ loading: false })
    }
  }

  // buy Token(CRT) for use
  async buyToken(buyAmount) {
    if(this.state.curator!=='undefined'){
      try{
        console.log("App.js: " + buyAmount)
        
        await this.state.curator.methods.buyToken().send({value: web3.utils.toWei(buyAmount, 'ether'), from: this.state.account})
      } catch (e) {
        console.log('Error, buyToken: ', e)
      }
    }
  }

  // sell Token(CRT) for ETH
  async sellToken(sellAmount) {
    this.setState({ curator })
    var tempBalance = this.state.curator.methods.balanceOf(this.state.account).call()

    if(this.state.curator!=='undefined' && tempBalance >= sellAmount){
      try{
        console.log("App.js: " + sellAmount)
        await this.state.curator.methods.sellToken().send({value: sellAmount, from: this.state.account})
      } catch (e) {
        console.log('Error, buyToken: ', e)
      }
    }
  }

  async getBalance() {
    var balance = await this.state.curator.methods.balanceOf(this.state.account);
    return balance;
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      curator: null,
      images: [],
      loading: true
    }

    this.uploadImage = this.uploadImage.bind(this)
    this.tipImageOwner = this.tipImageOwner.bind(this)
    this.captureFile = this.captureFile.bind(this)
    this.buyToken = this.buyToken.bind(this)
    this.sellToken = this.sellToken.bind(this)
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        { this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main
              images={this.state.images}
              captureFile={this.captureFile}
              uploadImage={this.uploadImage}
              tipImageOwner={this.tipImageOwner}
              buyToken={this.buyToken}
              sellToken={this.sellToken}
            />
        }
      </div>
    );
  }
}

export default App;