import {Component}        from 'react';

import Dashboard          from './Containers/Dashboard';
import Loading            from './Containers/Loading';
import ErrorPage          from './Containers/ErrorPage';
import SafeOwnership      from './Containers/SafeOwnership';
import Ballot             from './Containers/Ballot';

import BallotView         from './Components/BallotView';
import CreateBallot       from './Components/CreateBallot';
import RegisterVoterModal from './Components/RegisterVoterModal';
import Footer             from './Components/Footer';

import getWeb3            from './getWeb3';
import {
          StorageContract,
          ControllerContract, 
          SafeControllerContract, 
          BallotContract
        }                 from './Contracts.json';
import DeployedContracts  from './DeployedContracts.json';
import eventError         from './EventError';

import './App.css';


// Constants
const INVALID_NETWORK_ID    = 'INVALID_NETWORK_ID';
const ZERO_ADDRESS          = '0x0000000000000000000000000000000000000000';
const BALANCER_POOL_ADDRESS = process.env.REACT_APP_BALANCER_POOL_ADDRESS;
const SAFE_MANAGER_ADDRESS  = process.env.REACT_APP_SAFE_MANAGER_ADDRESS;

class App extends Component {

  state = {
    currentAccount  : '',
    errorMessage    : '',
    currectBallot   : {},
    currentVoter    : {},
    allBallots      : [],
    safeProposals   : [],
    isLoaded        : false,
    errorEncountered: false,
    isBallotSelected: false,
  }

  getNetworkId = async () => {
    const networkId = await this.web3.eth.net.getId();
    return networkId === 5777 ? 1337 : networkId;
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
                  currentVoter: {},
                  currentAccount: accounts[0]
                })
              }
      );

      window.ethereum.on(
        'chainChanged',
        ()=>window.location.reload()
      )

      const accounts = await this.web3.eth.getAccounts();

      const deployedContracts = DeployedContracts[await this.getNetworkId()];
      
      if(!deployedContracts) throw Error(INVALID_NETWORK_ID);

      // Creating instance for Storage Contract
      this.Storage = new this.web3.eth.Contract(StorageContract.abi, deployedContracts.storage);

      // Creating instance for Controller Contract
      this.Controller = new this.web3.eth.Contract(ControllerContract.abi, deployedContracts.controller);

      //Creating instance for SafeController Contract
      this.SafeController = new this.web3.eth.Contract(SafeControllerContract.abi, deployedContracts.safeController);

      // Creating Ballot blueprint
      this.BallotFactory = new this.web3.eth.Contract(BallotContract.abi);

      console.log({Storage: this.Storage, Controller: this.Controller, SafeController: this.SafeController});

      this.getVoterDetails(accounts[0]);
      this.getSafeProposals();
      this.getAllBallots();

      // Event Listeners
      this.listenToSafeProposal();
      this.listenToSafeProposalEnd();
      this.listenToBallotCreation();

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
      if(error.message === INVALID_NETWORK_ID) {
        this.setState({
          errorEncountered: true,
          errorMessage: "Please switch to network ID that we support. Thank You."
        })
        return;
      }
      console.error(error);
      this.setState({
        errorEncountered: true,
        errorMessage: "Ooops! Gateway denied entry, try again after solving the error."
      })
    }
  }

  onHide = () => this.setState({ show : false });
  onShow = () => this.setState({ show : true });

  generateOptions = (currentAccount) => ({
    from: currentAccount,
    gas: this.gas,
    gasPrice: this.gasPrice
  })

  // Events Subscribtions
  listenToBallotCreation = () => {
    this.Storage.events.NewBallotCreated()
    .on('data',(event)=>{
      const {ballot_address, ballot_id, ballot_for} = event.returnValues;
      const ballot = {
        id: ballot_id, 
        ballot_state: 0, 
        title: ballot_for,
        contract_address: ballot_address
      };
      console.log(event, ballot);
      const {allBallots} = this.state;
      allBallots.push(ballot);
      this.setState({
        allBallots
      });
      alert("New Ballot Created");
    })
    .on('error',eventError)
  }

  listenToBallotStateChanged = () => {
    this.Storage.events.BallotStateChanged()
    .on('data',(event)=>{
      const{ballot_id, status} = event.returnValues;
      const oldBallots = this.state.allBallots;
      const newBallots = oldBallots.map(
        (ballot) => {
          if(ballot.id === ballot_id){
            ballot.ballot_state = status;
          }
          return ballot;
        }
      )
      console.log({ballot_id, event, newBallots, oldBallots})
      this.setState({
        allBallots: newBallots
      })
    })
    .on('error',eventError)
  }

  listenToSafeProposal = () => {
    this.SafeController.events.NewOwnershipProposalCreated()
    .on('data', (event)=>{
      const {action, proposal_id, new_threshold, proposed_owner} = event.returnValues;
      const proposal = {
        proposedOwner: proposed_owner,
        proposalId: proposal_id,
        newThreshold: new_threshold,
        yesWt: 0,
        noWt: 0,
        action
      };
      console.log(event, proposal);
      const {safeProposals} = this.state;
      safeProposals.push(proposal);
      this.setState({
        safeProposals
      })
    })
    .on('error',eventError)
  }

  listenToSafeProposalEnd = () => {
    this.SafeController.events.OwnershipProposalEnded()
    .on('data', (event)=> {
      const {proposal_id, success} = event.returnValues;
      alert(`Proposal ${proposal_id} was ${success?'Accepted':'Rejected'}!`);
      const {safeProposals} = this.state;
      const newProposals = safeProposals.filter(
        ({proposalId})=> proposalId !== proposal_id
      );
      this.setState({
        safeProposals: newProposals
      });
    })
    .on('error', eventError)
  }

  // Voter Interaction
  registerVoter = async (name) => {
    const {currentAccount} = this.state;
    try{
      await this.Controller.methods.storageRegisterVoter(name).send(this.generateOptions(currentAccount));
      return true;
    } catch (error) {
      console.error(error);
      alert("Error while registering. Check if the Balance Pool Address is correct or not.");
      return false;
    }
  }

  getVoterDetails = async (voter_account) => {
    const flag = await this.Storage.methods.is_voter(voter_account).call();
    if(flag !== '1'){
      this.setState({
        show: true
      })
      return;
    }
    const voterId = await this.Storage.methods.address_to_voter_id(voter_account).call();
    const {account, id, name, vote_wt} = await this.Storage.methods.id_to_voter(voterId).call();
    this.setState({
      currentVoter: {account, id, name, vote_wt},
      show: false
    })
  }


  // Ballot Interaction

  createBallot = async (title) => {
    const {currentAccount} = this.state;
    try{
      const response = await this.Controller.methods.ballotCreateBallot(title).send(this.generateOptions(currentAccount));
      console.log(response);
    } catch (error) {
      console.error(error);
      alert("");
    }
  }

  createProposals = async ( ballotAddress, proposalTitles, proposalDocuments) => {
    const {currentAccount} = this.state;
    try{
      const response = await this.Controller.methods.ballotCreateProposals(ballotAddress, proposalTitles, proposalDocuments).send(this.generateOptions(currentAccount));
      console.log(response);
      return true;
    } catch (error) {
      console.log(error);
      alert("");
      return false;
    }
  }

  cancelBallot = async (ballotId) => {
    const {currentAccount} = this.state;
    try{
      const response = await this.Controller.methods.ballotCancelBallot(ballotId).send(this.generateOptions(currentAccount))
      console.log(response);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  startVoting = async (ballotId) => {
    const {currentAccount} = this.state;
    try{
      const response = await this.Controller.methods.ballotStart(ballotId).send(this.generateOptions(currentAccount));
      console.log(response);
    } catch (error) {
      console.error(error);
      alert("");
    }
  }

  endVoting = async (ballotId) => {
    const {currentAccount} = this.state;
    try{
      const response = await this.Controller.methods.ballotEnd(ballotId).send(this.generateOptions(currentAccount));
      console.log(response);
    } catch (error) {
      console.error(error);
      alert("");
    }
  }

  castVote = (ballotAddress) => async (proposalId) => {
    const {currentAccount} = this.state;
    try{
      const response = await this.Controller.methods.ballotCastVote(ballotAddress,proposalId).send(this.generateOptions(currentAccount));
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  }

  getAllBallots = async () => {
    const response = await this.Storage.methods.getAllBallots().call();
    const ballots = response.map(
      ({ballot_state, contract_address, id, title}) => ({ballot_state, contract_address, id, title})
    )
    this.setState({
      allBallots: ballots
    })
    console.log(ballots);
  }

  getAllProposals = async (ballotAddress) => {
    const ballot = this.BallotFactory;
    ballot.options.address = ballotAddress;
    const response = await ballot.methods.getAllProposals().call();
    console.log(response);
    return response
  }

  checkWinner = async (ballotAddress) => {
    const ballot = this.BallotFactory;
    ballot.options.address = ballotAddress;
    const response = await ballot.methods.getWinner().call();
    console.log(response);
    return response;
  }

  // GNOSIS Safe Interaction

  createSafeProposal = async (proposalAction, proposedOwner, newThreshold) => {
    const {currentAccount} = this.state;
    const createTx = await this.Controller.methods.safeCreateOwnershipProposal(proposalAction, proposedOwner, newThreshold);
    return await createTx.send(this.generateOptions(currentAccount))
                  .on('receipt',(receipt)=>{
                      console.log(receipt);
                      return true;
                    })
                  .on('error',(error)=>{
                      console.log(error);
                      return false;
                    });           
  }

  safeVote = async (safeProposalId, action) => {
    const {currentAccount} = this.state;
    if(action === 1) {
      await this.Controller.methods.safeYes(safeProposalId).send(this.generateOptions(currentAccount));
      return;
    }
    await this.Controller.methods.safeNo(safeProposalId).send(this.generateOptions(currentAccount));
  }

  getSafeProposals = async () => {
    const proposals = await this.SafeController.methods.getAllActiveProposals().call();
    const safeProposals = proposals.map(
      ({proposedOwner, proposalId, newThreshold, yesWt, noWt, action,}) => ({proposedOwner, proposalId, newThreshold, yesWt, noWt, action})
    ).filter(
      ({proposedOwner}) => proposedOwner !== ZERO_ADDRESS
    );
    this.setState({
      safeProposals: safeProposals
    })
  }

  handleCreateBallot = async (title) => {
    await this.createBallot(title);
  }

  handleSelectBallot = (selectedId) => {
    const {allBallots} = this.state;
    const ballot = allBallots.find(
      ({id})=> id===selectedId
    );
    this.setState({
      currentBallot: ballot,
      isBallotSelected: true
    })
    console.log(ballot);
  }

  handleClearCurrentBallot = () => {
    this.setState({
      currentBallot: {},
      isBallotSelected: false
    })
  }

  renderBallots = (ballots) => {
    ballots.map(
      ballot => <Ballot />
    )
  }
  
  render() {

        const {
            show,
            isLoaded,
            allBallots,
            errorMessage,
            safeProposals,
            currentBallot,
            errorEncountered,
            isBallotSelected
          } = this.state;
        const {
            onHide,
            safeVote,
            castVote,
            endVoting,
            startVoting,
            checkWinner,
            cancelBallot,
            registerVoter,
            createProposals, 
            getAllProposals,
            createSafeProposal,

            handleCreateBallot,
            handleSelectBallot,
            handleClearCurrentBallot
          } = this;

    return (
      <div className="App">
        {
          isLoaded?
          <>
            <RegisterVoterModal show={show} onHide={onHide} registerVoter={registerVoter} />
            <Dashboard />

            <p>
              Balancer Pool Address = <a rel={'noreferrer noopener'} 
                                         target={'_blank'} 
                                         href={`https://rinkeby.pools.balancer.exchange/#/pool/${BALANCER_POOL_ADDRESS}`}>
                                           {BALANCER_POOL_ADDRESS}
                                      </a>
              <br/>
              Safe Manager Address = <a rel={'noreferrer noopener'} 
                                        target={'_blank'} 
                                        href={`https://rinkeby.gnosis-safe.io/app/#/safes/${SAFE_MANAGER_ADDRESS}`} >
                                          {SAFE_MANAGER_ADDRESS}
                                      </a>
            </p>
            <div className={'row m-0'}>
                <div className={'col-12 col-md-8 pb-5'}>
                  {
                    !isBallotSelected?
                      <>
                        <CreateBallot handleCreateBallot={handleCreateBallot} />
                        <BallotView ballots={allBallots} handleSelectBallot={handleSelectBallot} />
                      </>
                      :
                      <Ballot 
                        currentBallot={currentBallot} 
                        getAllProposals={getAllProposals} 
                        handleClearCurrentBallot={handleClearCurrentBallot} 
                        createProposals={createProposals} 
                        cancelBallot={cancelBallot} 
                        startVoting={startVoting}
                        endVoting={endVoting}
                        checkWinner={checkWinner}
                        castVote={castVote}
                        Ballot={this.BallotFactory}
                        />
                  }
              </div>

              <div className={'col-12 col-md-4 d-flex flex-wrap justify-content-center pt-5 top-border-black'}>
                <SafeOwnership createSafeProposal={createSafeProposal} safeProposals={safeProposals} safeVote={safeVote} />
              </div>

            </div>
            <Footer />
            </>
            :
            errorEncountered?
                <ErrorPage message={errorMessage} />
                :
                <Loading />
        }
      </div>
    );
  }


}

export default App;