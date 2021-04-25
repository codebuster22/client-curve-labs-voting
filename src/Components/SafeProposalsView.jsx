import SafeOwnershipProposal from './SafeOwnershipProposal';
import SafeProposalContainer from './SafeProposalContainer';

const SafeProposalsView = ({safeProposals, safeVote}) => {

    const renderSafeProposals = () => 
                    safeProposals.map(
                      ({action, proposedOwner, newThreshold, proposalId}) => 
                                <SafeOwnershipProposal key={proposalId} id={proposalId} safeVote={safeVote} action={action} proposedOwner={proposedOwner} newThreshold={newThreshold} />
                    );
  
    return (
      <SafeProposalContainer>
        {renderSafeProposals()}
      </SafeProposalContainer>
    )
  }

export default SafeProposalsView;