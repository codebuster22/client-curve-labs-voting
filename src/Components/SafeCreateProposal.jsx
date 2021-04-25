import {useState} from 'react';

const SafeCreateProposal = ({createSafeProposal}) => {

    const [proposedOwner, setProposedOwner] = useState('');
    const [action, setAction] = useState('');
    const [newThreshold, setNewThreshold] = useState('');
  
    const setStateToInitialValue = () => {
      setProposedOwner('');
      setAction('');
      setNewThreshold('');
    }
  
    const handleSetProposedOwner = (event) => setProposedOwner(event.target.value);
    const handleSetNewThreshold  = (event) => setNewThreshold (event.target.value);
    const handleSetAction        = (event) => setAction       (event.target.value);
  
    const handleCreateSafeProposal = async () => {
      const flag = await createSafeProposal(action, proposedOwner, newThreshold);
      if(!flag) {
        alert("Encountered some error");
        return;
      }
      setStateToInitialValue();
  
    }
  
    return (
      <div className={'safe-create-proposal p-2'} style={{maxWidth: '30rem'}}>
        <h4>
          Create a proposal to add/remove address from GNOSIS Safe
        </h4>
        <form>
          <div className={'form-group'}>
            <label htmlFor={'proposedOwner'}>Proposed Owner</label>
            <input type={'text'} className={'form-control'} value={proposedOwner} onChange={handleSetProposedOwner} id={'proposedOwner'} name={'proposedOwner'} placeholder={'Proposed Owner'} />
          </div>
          <div className={'form-group'}>
            <label htmlFor={'newThreshold'}>New Threshold</label>
            <input type={'number'} className={'form-control'} value={newThreshold} onChange={handleSetNewThreshold} name={'newThreshold'} placeholder={'New Threshold'} />
          </div>
          <div className={'form-group'}>
            <select value={action} className={'form-control'} onChange={handleSetAction} name={'proposalAction'}>
                <option value={''} disabled>Select Action</option>
                <option value={1}>Add Owner</option>
                <option value={0}>Remove Owner</option>
            </select>
          </div>
          <button type={'button'} className={'btn btn-primary'} onClick={handleCreateSafeProposal}>
            Create Safe Proposal
          </button>
        </form>
      </div>
    )
  }

  export default SafeCreateProposal;