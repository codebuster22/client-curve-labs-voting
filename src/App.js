import {Component} from 'react';

import Dashboard from './Containers/Dashboard';
import Loading   from './Containers/Loading';

import './App.css';

import getWeb3 from './getWeb3';
import {Storage, Controller, Ballot} from './Contracts.json';

class App extends Component {

  state = {
    isLoaded: false,
    ballotTitle: '',
    currentProposalTitle: '',
    currentProposalDocument: '',
    proposals: [],
    ballotId: 0,
    ballotAddress: '0x02eE41e4377ab7A0670bd83D2F02E5ba73c4E20E',
    currentAccount: '',
    voterName: '',
    proposalId: 0
  }

  componentDidMount = async () => {
    try {

      this.web3 = await getWeb3();

      this.gas = 3000000;
      this.gasPrice = this.web3.utils.toWei(`2`,`Gwei`);

      window.ethereum.on(
        'accountsChanged',
        (accounts)=>
              {
                this.getVoterDetails(accounts[0]);
                this.setState({
                  currentAccount: accounts[0]
                })
              }
      );


      const accounts = await this.web3.eth.getAccounts();

      this.networkId = await this.web3.eth.net.getId();

      // Creating instance for Storage Contract
      this.StorageInstance = new this.web3.eth.Contract(Storage.abi, Storage.address);
      window.StorageInstance = this.StorageInstance;

      // Creating instance for Controller Instance
      this.ControllerInstance = new this.web3.eth.Contract(Controller.abi, Controller.address);

      // Creating Ballot blueprint
      this.BallotInstance = new this.web3.eth.Contract(Ballot.abi);

      console.log({Storage: this.StorageInstance, Controller: this.ControllerInstance});

      this.getVoterDetails(accounts[0]);

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

  generateOptions = (currentAccount) => ({
    from: currentAccount,
    gas: this.gas,
    gasPrice: this.gasPrice
  })

  createBallot = async (title) => {
    const {currentAccount} = this.state;

    try{
      const response = await this.ControllerInstance.methods.createBallot(title).send(this.generateOptions(currentAccount));
      console.log(response);
    } catch (error) {
      console.error(error);
      alert("");
    }
  }

  createProposals = async ( ballotId ,proposalTitles, proposalDocuments) => {
    const {currentAccount} = this.state;
    try{
      const response = await this.ControllerInstance.methods.createMultipleProposals(ballotId, proposalTitles, proposalDocuments).send(this.generateOptions(currentAccount));
      console.log(response);
      return true;
    } catch (error) {
      console.log(error);
      alert("");
      return false;
    }
  }

  cancelBallot = async () => {
    const {currentAccount, ballotId} = this.state;
    try{
      const response = await this.ControllerInstance.methods.cancelBallot(ballotId).send(this.generateOptions(currentAccount))
      console.log(response);
    } catch (error) {
      console.error(error);
      alert("")
    }
  }

  getAllBallots = async () => {
    const response = await this.ControllerInstance.methods.getAllBallots().call();
    console.log(response);
  }

  getAllProposals = async () => {
    const {ballotAddress} = this.state;
    this.BallotInstance.options.address = ballotAddress;
    const response = await this.BallotInstance.methods.getAllProposals().call();
    console.log(response);
  }

  startVoting = async () => {
    const {currentAccount, ballotId} = this.state;
    try{
      const response = await this.ControllerInstance.methods.start(ballotId).send(this.generateOptions(currentAccount));
      console.log(response);
    } catch (error) {
      console.error(error);
      alert("");
    }
  }

  endVoting = async () => {
    const {currentAccount, ballotId} = this.state;
    try{
      const response = await this.ControllerInstance.methods.end(ballotId).send(this.generateOptions(currentAccount));
      console.log(response);
    } catch (error) {
      console.error(error);
      alert("");
    }
  }

  castVote = async (proposalId) => {
    const {currentAccount, ballotAddress} = this.state;
    this.BallotInstance.options.address = ballotAddress;
    try{
      const response = await this.BallotInstance.methods.castVote(proposalId).send(this.generateOptions(currentAccount));
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  }

  checkWinner = async () => {
    const {ballotAddress} = this.state;
    this.BallotInstance.options.address = ballotAddress;
    const winnerProposalId = await this.BallotInstance.methods.winnerIndex().call()
    console.log({winnerProposalId});
    const winner = await this.BallotInstance.methods.proposals(winnerProposalId).call();
    console.log({winner});
  }

  registerVoter = async (account, name) => {
    const {currentAccount} = this.state;
    try{
      const response = await this.StorageInstance.methods.registerVoter(account, name).send(this.generateOptions(currentAccount));
      console.log(response);
    } catch (error) {
      console.error(error);
      alert("Error while registering. Check if the Balance Pool Address is correct or not.");
    }
  }

  getVoterDetails = async (account) => {
    console.log(typeof account);
    const flag = await this.StorageInstance.methods.is_voter(account).call();
    console.log(flag);
    if(flag !== 1){
      alert("First, register as voter.");
      return;
    }
    const voterId = await this.StorageInstance.methods.address_to_voter_id(account).call();
    const voter = await this.StorageInstance.methods.id_to_voter(voterId).call();
    console.log({flag, voterId, voter});
  }

  handleChange = (event) => {
    const target = event.target;
    const value = target.type == 'checkbox'? 'checked': target.value;
    const name = target.name;
    this.setState({
      [name]: value
    })
  }

  handleCreateBallot = async () => {
    const {ballotTitle} = this.state;
    await this.createBallot(ballotTitle);
  }

  handleAddProposal = () => {
    const {currentProposalTitle, currentProposalDocument, proposals} = this.state;
    proposals.push(
      {
        title: currentProposalTitle,
        document: currentProposalDocument
      }
    );
    this.setState({
      currentProposalDocument: '',
      currentProposalTitle: '',
      proposals: proposals
    });
  }

  handleCreateProposals = () => {
    const {proposals, ballotId} = this.state;
    const proposalTitles = [];
    const proposalDocuments = [];
    proposals.forEach(
      ({title, document})=>{
        proposalTitles.push(title);
        proposalDocuments.push(document);
      }
    )
    console.log(`Proposals to be created`,proposalTitles, proposalDocuments);
    this.createProposals(ballotId, proposalTitles, proposalDocuments).then(
      (flag)=>flag?this.setState({proposals: [], ballotId: null}):null
    );
  }

  renderAllProposals = (proposals) => {
    return proposals.map(
      ({title, document})=><><p>Title:- {title}</p><p>Document:- {document}</p></>
    )
  }
  
  render() {

        const {
            isLoaded,
            currentAccount, 
            ballotTitle, 
            currentProposalTitle, 
            currentProposalDocument, 
            proposals, 
            ballotId, 
            ballotAddress, 
            voterName,
            proposalId
          } = this.state;
        const {
            registerVoter,
            handleChange,
            handleCreateBallot,
            handleAddProposal,
            renderAllProposals, 
            handleCreateProposals, 
            getAllBallots, 
            getAllProposals, 
            cancelBallot,
            startVoting,
            endVoting,
            checkWinner,
            castVote
          } = this;

    return (
      <div className="App">
        {
          isLoaded?
            <>
            <Dashboard />

            <p>
              Balancer Pool Address = <a rel={'noreferrer'} target={'_blank'} href={'https://rinkeby.pools.balancer.exchange/#/pool/0x1A7F38418aF5AaBF0fcAe420Ea0b9BbF7bBfd34b'}>0x1A7F38418aF5AaBF0fcAe420Ea0b9BbF7bBfd34b</a>
            </p>

            <input type={'text'} value={voterName} onChange={handleChange} name={'voterName'} placeholder={'Voter Name'} />
            <button onClick={()=>registerVoter(currentAccount, voterName)}>register</button>
            <br />
            <input value={ballotTitle} onChange={handleChange} name={'ballotTitle'} placeholder={'Ballot Title'} />
            <button onClick={handleCreateBallot} >Create Ballot</button>
            <br />

            <input type={'number'} value={ballotId} onChange={handleChange} name={'ballotId'} placeholder={'Ballot ID'} />
            <input type={'text'} value={currentProposalTitle} onChange={handleChange} name={'currentProposalTitle'} placeholder={'Proposal Title'} />
            <input type={'text'} value={currentProposalDocument} onChange={handleChange} name={'currentProposalDocument'} placeholder={'Proposal Document'} />
            <button onClick={handleAddProposal} >Add Proposal</button>
            <br />
            {renderAllProposals(proposals)}
            <br />
            <button onClick={handleCreateProposals}>Create Proposal</button>

            <br />
            <button onClick={getAllBallots}>get all ballots</button>

            <br />
            <input type={'text'} value={ballotAddress} onChange={handleChange} name={'ballotAddress'} placeholder={'Ballot Address'} />
            <button onClick={getAllProposals} >Get all proposals</button>

            <br/>
            <input type={'number'} value={ballotId} onChange={handleChange} name={'ballotId'} placeholder={'Ballot ID'} />
            <button onClick={cancelBallot} >Cancel Ballot</button>

            <br/>
            <input type={'number'} value={ballotId} onChange={handleChange} name={'ballotId'} placeholder={'Ballot ID'} />
            <button onClick={startVoting}>Start Voting</button>
            <button onClick={endVoting}>End Voting</button>

            <br />
            <input type={'text'} value={ballotAddress} onChange={handleChange} name={'ballotAddress'} placeholder={'Ballot Address'} />
            <button onClick={checkWinner} >Get Ballot Winner</button>

            <br />
            <input type={'text'} value={proposalId} onChange={handleChange} name={'proposalId'} placeholder={'Proposal ID'} />
            <button onClick={()=>castVote(proposalId)} >Cast Vote</button>
            <ViewBallots />
            </>
            :
            <Loading />
        }
      </div>
    );
  }


}

export default App;


const ViewBallots = () => {

  return (
    <div className={'view-ballots'}>

    </div>
  )

}