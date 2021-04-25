import BallotCard from './BallotCard';
import BallotContainer from './BallotContainer';

const BallotView = ({ballots, handleSelectBallot}) => {

    const renderBallots = () => {
      return ballots.map(
        ({ballot_state, contract_address, id, title}) =>
                   <BallotCard ballot_state={ballot_state} handleSelectBallot={handleSelectBallot} contract_address={contract_address} id={id} key={id} title={title} />
      )
    }
  
    return (
      <div className={'ballot-view'}>
        <BallotContainer >
          {renderBallots()}
        </BallotContainer>
      </div>
    )
  
}

export default BallotView;