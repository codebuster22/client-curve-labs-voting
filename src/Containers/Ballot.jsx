import {useState, useEffect} from 'react'
import { FontAwesomeIcon }   from '@fortawesome/react-fontawesome';
import { faArrowLeft }       from '@fortawesome/free-solid-svg-icons';

import eventError            from '../EventError';
import ProposalCard          from '../Components/ProposalCard';
import AddProposals          from '../Components/AddProposals';

const Ballot = ({
            currentBallot, 
            getAllProposals, 
            handleClearCurrentBallot, 
            createProposals, 
            cancelBallot,
            startVoting,
            endVoting,
            checkWinner,
            castVote,
            Ballot
          }) => {
        const {title, contract_address, ballot_state, id} = currentBallot;

        const [proposals, setProposals]     = useState([]);
        const [winnerId, setWinnerId]       = useState('');
        const [winner, setWinner]           = useState({});
        const [ballotState, setBallotState] = useState(ballot_state);
        
        Ballot.options.address = contract_address;
        
        Ballot.events.NewVoteCasted()
        .on('data',(event)=>{
            const {proposal_id, vote_count} = event.returnValues;
            const newProposals = proposals;
            try {
                newProposals[proposal_id].votes = vote_count;
            }catch (error) {
                console.log('Handling multiple update')
            }
            setProposals(newProposals);
        })
        .on('error',eventError);

        Ballot.events.WinnerProposal()
        .on('data',(event)=>{
            const {proposal_id} = event.returnValues;
            setWinnerId(proposal_id);
        })
        .on('error',eventError);

        Ballot.events.VotingStarted()
        .on('data',(event)=>setBallotState(1))
        .on('error',eventError);

        Ballot.events.VotingEnded()
        .on('data',(event)=>setBallotState(3))
        .on('error',eventError);

        const saveAsObject = ({name, votes, document_hash}) => ({name, votes, document_hash});

        useEffect(
            ()=>{
                getAllProposals(contract_address).then((proposals)=>setProposals(proposals.map(saveAsObject)));
            },[]
        )

        useEffect(
            ()=>{
                if( !isNaN( winnerId ) ) handleCheckWinner(contract_address);
            }, [winnerId]
        )

        const handleCheckWinner = async () => {
        const winner = await checkWinner(contract_address);
        console.log("winner announced");
        setWinner(winner);
        }

        const handleStart = () => startVoting(id);
        const handleEnd   = () => endVoting  (id);

        const handleCancelBallot = async () => {
            const flag = await cancelBallot(id);
            if(flag){
                handleClearCurrentBallot();
                alert("Successfully cancelled a ballot");
                return;
            }
            alert("Encountered some error.");
        }

        const renderProposals = () => proposals.map(
        ({name, document_hash, votes}, index) => <ProposalCard 
                                            key={index} 
                                            id={index} 
                                            name={name} 
                                            document_hash={document_hash} 
                                            votes={votes} 
                                            castVote={castVote(contract_address)}
                                        />
        )
        
        return (
            <div className={'ballot tc'}>
                <FontAwesomeIcon icon={faArrowLeft} onClick={handleClearCurrentBallot} />
                <h3>
                    {title}
                </h3>
                <h6>Ballot Address:- {contract_address}</h6>
                <button onClick={handleCancelBallot} type={'button'} className={'btn btn-danger'}>
                    Cancel Ballot
                </button>
                <button onClick={handleStart} type={'button'} className={'btn btn-primary'}>
                    Start Voting
                </button>
                <button onClick={handleEnd} type={'button'} className={'btn btn-primary'}>
                    End Voting
                </button>
                <p>
                    Ballot Status:- {ballotState}
                </p>
                {
                    ballotState <= 1 ?
                    <></>
                    :
                    <h5>Winning Proposal:- {winner.name}</h5>
                }
                {
                    ballotState > 0?
                    <></>
                    :
                    <div className={'w-100 d-flex justify-content-center'}>
                      <AddProposals ballot_address={contract_address} createProposals={createProposals} />
                    </div>
                }
                <div className={'proposal-container d-flex flex-wrap justify-content-center'}>
                    {renderProposals()}
                </div>
            </div>
    )   
}

export default Ballot;