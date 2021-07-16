import React, { Component } from 'react';
import Identicon from 'identicon.js';

class Main extends Component {

  render() {
    return (
      <div className="container-fluid mt-5 bg-light">
        <div className="row">
          <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '550px' }}>
            <div className="content mr-auto ml-auto">
              <p>&nbsp;</p>
              {/* Token Market: User can buy and sell Token <=> ETH */}
              <h2 class="text-center">Token Market</h2>
              <div className="row">

                <form class="col-lg-6" onSubmit={(event) => {
                  event.preventDefault()
                  const amount = this.buyAmount.value
                  console.log(amount)
                  this.props.buyToken(amount)
                }} >
                  <div className="form-group mr-sm-2">
                      <br></br>
                        <input
                          id="buyAmount"
                          type="text"
                          ref={(input) => { this.buyAmount = input }}
                          className="form-control"
                          placeholder="Number of Token..."
                          required />
                    </div>
                  <button type="submit" class="btn btn-warning btn-block btn-lg">Buy Token</button>
                </form>

                <form class="col-lg-6" onSubmit={(event) => {
                  event.preventDefault()
                  const amount = this.sellAmount.value
                  console.log(amount)
                  this.props.sellToken(amount)
                }} >
                  <div className="form-group mr-sm-2">
                      <br></br>
                        <input
                          id="sellAmount"
                          type="text"
                          ref={(input) => { this.sellAmount = input }}
                          className="form-control"
                          placeholder="Number of Token..."
                          required />
                    </div>
                  <button type="submit" class="btn btn-success btn-block btn-lg">Sell Token</button>
                </form>

              </div>
              <br></br>
              <hr></hr>

              <p>&nbsp;</p>
              <h2 class="text-center">Post Your Product</h2>
              <br></br>

              {/* for Save file(IMG) to IPFS */}
              <form onSubmit={(event) => {
                event.preventDefault()
                const description = this.imageDescription.value
                this.props.uploadImage(description)
              }} >
                <input type='file' accept=".jpg, .jpeg, .png, .bmp, .gif" onChange={this.props.captureFile} />
                  <div className="form-group mr-sm-2">
                    <br></br>
                      <input
                        id="imageDescription"
                        type="text"
                        ref={(input) => { this.imageDescription = input }}
                        className="form-control"
                        placeholder="Image description..."
                        required />
                  </div>
                <button type="submit" class="btn btn-primary btn-block btn-lg">POST!</button>
              </form>

              {/* Post listing */}
              {/* Tip for Author: Good Post can take tip from other user */}
              <p>&nbsp;</p>
              { this.props.images.map((image, key) => {
                return(
                  <div className="card mb-4" key={key} >
                    <div className="card-header">
                      <img
                        className='mr-2'
                        width='30'
                        height='30'
                        src={`data:image/png;base64,${new Identicon(image.author, 30).toString()}`}
                      />
                      <small className="text-muted">{image.author}</small>
                    </div>
                    <ul id="imageList" className="list-group list-group-flush">
                      <li className="list-group-item">
                        <p class="text-center"><img src={`https://ipfs.infura.io/ipfs/${image.hash}`} style={{ maxWidth: '420px'}}/></p>
                        <p>{image.description}</p>
                      </li>
                      <li key={key} className="list-group-item py-2">
                        <small className="float-left mt-1 text-muted">
                          TIPS: {image.tipAmount.toString()} CRT
                        </small>
                        <button
                          className="btn btn-link btn-sm float-right pt-0"
                          name={image.id}
                          onClick={(event) => {
                            let tipAmount = 1
                            console.log(event.target.name, tipAmount)
                            this.props.tipImageOwner(event.target.name, image.author, tipAmount)
                          }}
                        >
                          TIP 1 CRT
                        </button>
                      </li>
                    </ul>
                  </div>
                )
              })}
            </div>
          </main>
        </div>
      </div>
    );
  }
}

export default Main;