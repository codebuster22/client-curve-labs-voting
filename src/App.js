import {Component} from 'react';

import getWeb3 from './getWeb3';

import Dashboard from './Containers/Dashboard';
import Loading   from './Containers/Loading';

import './App.css';

class App extends Component {

  state = {
    isLoaded: false
  }

  componentDidMount = async () => {
    try {

      this.web3 = await getWeb3();

      this.gas = 3000000;
      this.gasPrice = this.web3.utils.toWei(`2`,`Gwei`);

      window.ethereum.on(
        'accountsChanged',
        (accounts)=>
              this.setState({
                currentAccount: accounts[0]
              })
      );


      const accounts = await this.web3.eth.getAccounts();

      this.networkId = await this.web3.eth.net.getId();

      // Timeout because, I wanted to show the loading page animation :)
      // Setting state and setting isLoaded true to display the page.
      setTimeout(
        ()=>{
          this.setState({
            isLoaded: true,
            currentAccount: accounts[0]
          })
        },500
      )

    } catch (error) {
      console.error(error);
      alert("Ooops! Gateway denied entry, try again after solving the error.")
    }
  }
  
  render() {

    const {isLoaded} = this.state;
    const {} = this;

    return (
      <div className="App">
        {
          isLoaded?
          <Dashboard />
          :
          <Loading />
        }
      </div>
    );
  }


}

export default App;
