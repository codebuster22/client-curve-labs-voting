import {useState} from 'react';
import {Card} from 'react-bootstrap';

const AddProposals = ({ballot_address ,createProposals}) => {
    const [currentProposalTitle, setCurrentProposalTitle] = useState('');
    const [currentProposalDocument, setCurrentProposalDocument] = useState('');
    const [proposals, setProposals] = useState([]);

    const setStateToInitialValue = () => {
      setCurrentProposalDocument('');
      setCurrentProposalTitle('');
      setProposals([]);
    }

    const handleTitleChange = (event) => setCurrentProposalTitle(event.target.value);
    const handleDocumentChange = (event) => setCurrentProposalDocument(event.target.value);

    const handleAddProposal = () => {
      if(currentProposalDocument==='' || currentProposalTitle==='') return;
      const newProposals = proposals;
      newProposals.push(
        {
          title: currentProposalTitle,
          document: currentProposalDocument
        }
      );
      setProposals(newProposals);
      setCurrentProposalTitle('');
      setCurrentProposalDocument('');
    }

    const handleCreateProposals = () => {
      const proposalTitles = [];
      const proposalDocuments = [];
      proposals.forEach(
        ({title, document})=>{
          proposalTitles.push(title);
          proposalDocuments.push(document);
        }
      )
      console.log(`Proposals to be created`,proposalTitles, proposalDocuments);
      createProposals(ballot_address, proposalTitles, proposalDocuments).then(
        (flag)=>flag?setStateToInitialValue():null
      );
    }

    const renderAllProposals = (proposals) => {
      return proposals.map(
        ({title, document}, index)=><Card>
                                        <Card.Title>{title}</Card.Title>
                                    </Card>
      )
    }

    return (
      <div className={'add-proposals'} style={{width: '24rem'}} >
        <div className={'form-group'}>
          <label>Proposal Title</label>
          <input type={'text'} className={'form-control'} value={currentProposalTitle} onChange={handleTitleChange} name={'currentProposalTitle'} placeholder={'Proposal Title'} />
        </div>
        <div className={'form-group'}>
          <label>Proposal Document</label>
          <input type={'text'} className={'form-control'} value={currentProposalDocument} onChange={handleDocumentChange} name={'currentProposalDocument'} placeholder={'Proposal Document'} />
        </div>
        <button type={'button'} className={'btn btn-secondary mb-2'} onClick={handleAddProposal} >Add Proposal</button>
        <div>
          {renderAllProposals(proposals)}
        </div>
        <button type={'button'} class={'btn btn-primary mt-2'} onClick={handleCreateProposals}>Create Proposal</button>
      </div>
    )


}

export default AddProposals;