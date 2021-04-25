import {Card} from 'react-bootstrap';

const ProposalCard = ({name, document_hash, votes, id, castVote}) => {

    const handleCastVote = () => castVote(id);
  
    return (
      <Card style={{ width: '18rem' }}>
        <Card.Body>
          <Card.Title>{name}</Card.Title>
          <Card.Subtitle>Total Votes:- {votes}</Card.Subtitle>
          <a rel={'noreferrer'} target={'_blank'} href={`https://ipfs.infura.io/ipfs/${document_hash}`}>View Document</a>
          <div>
            <button type={'button'} onClick={handleCastVote} className={'btn btn-primary'}>
              Cast Vote
            </button>
          </div>
        </Card.Body>
      </Card>
    )
  
}

export default ProposalCard;