import {Card} from 'react-bootstrap'

const BallotCard = ({title, status, handleSelectBallot, id}) => {
  
    return (
      <Card style={{ width: '18rem' }}>
        <Card.Body>
          <Card.Title>{title}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">{status}</Card.Subtitle>
          <button type={'button'} onClick={()=>handleSelectBallot(id)} className={'btn btn-primary'}>
            View Ballot
          </button>
        </Card.Body>
      </Card>
    )
}

export default BallotCard;