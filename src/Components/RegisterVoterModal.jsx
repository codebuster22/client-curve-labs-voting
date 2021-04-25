import {useState} from 'react';
import {Modal} from 'react-bootstrap';

const RegisterVoterModal = ({show, onHide, registerVoter}) => {

    const [isRegistering, setIsRegistering] = useState(false);
    const [voterName, setVoterName] = useState('');
  
    const register = async () => {
      setIsRegistering(true);
  
      const flag = await registerVoter(voterName);
      if(!flag){
        alert("Failed to register!");
        setIsRegistering(false);
        return;
      }
      alert("Welcome to the future.");
      setIsRegistering(true);
      onHide();
    }
  
    return (
      <Modal
          show={show}
          onHide={onHide}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
              Register here!
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h6>You are not registered, register here!</h6>
            <div className={'form-group mt-4'}>
              <label htmlFor={'usernameInput'}>
                User Name
              </label>
              <input value={voterName} onChange={(e)=>setVoterName(e.target.value)} className={'form-control'} id={'usernameInput'} type={'text'} />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button className={'btn btn-primary'} onClick={register}>
              {
                isRegistering?'Registering...':'Register'
              }
            </button>
          </Modal.Footer>
        </Modal>
    )
}

export default RegisterVoterModal;