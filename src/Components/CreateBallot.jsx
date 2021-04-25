import {useState} from 'react';

const CreateBallot = ({handleCreateBallot}) => {

    const [title, setTitle] = useState('');
  
    const handleTitleChange = (event) => setTitle(event.target.value);
  
    const handleCreate = () => {
      handleCreateBallot(title);
    }
  
    return (
      <div className={'create-ballot w-100 d-flex justify-content-center'} >
        <div>
          <div className={'form-group'} style={{width: '24rem'}} >
            <label htmlFor={'title'} >Ballot Title</label>
            <input value={title} className={'form-control'} onChange={handleTitleChange} id={'title'} name={'title'} placeholder={'Ballot Title'} />
          </div>
          <button type={'button'} className={'btn btn-primary'} onClick={handleCreate} >Create Ballot</button>
        </div>
      </div>
    )
  
}

export default CreateBallot;