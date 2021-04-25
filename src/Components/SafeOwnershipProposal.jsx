const SafeOwnershipProposal = ({id, action, proposedOwner, newThreshold, safeVote}) => {

    const handleYesVote = () => safeVote(id, 1);
    const handleNoVote  = () => safeVote(id, 0);
  
    return (
      <div className={'safe-ownership-proposal'}>
        <div className={`card ${parseInt(action)===1?'border-primary':'border-danger'}`} style={{maxWidth: "30rem", width: '100%'}}>
          <div className="card-body">
            <h5 className="card-title">{ parseInt(action)===1?'Add Owner':'Remove Owner' }</h5>
            <h6 className="card-subtitle mb-2 text-muted">New Threshold:- {newThreshold}</h6>
            <p className="card-text overflow-wrap">{proposedOwner}</p>
            <div className={'d-flex justify-content-around'} >
              <button onClick={handleYesVote} className="btn btn-primary">Yes</button>
              <button onClick={handleNoVote}  className="btn btn-danger">No</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

export default SafeOwnershipProposal;