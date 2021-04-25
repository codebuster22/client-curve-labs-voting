import SafeCreateProposal from '../Components/SafeCreateProposal';
import SafeProposalsView from '../Components/SafeProposalsView';

const SafeOwnership = ({createSafeProposal, safeProposals, safeVote}) => 
        <>
            <SafeCreateProposal createSafeProposal={createSafeProposal} />
            <SafeProposalsView safeProposals={safeProposals} safeVote={safeVote} />
        </>

export default SafeOwnership;