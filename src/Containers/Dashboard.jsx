import {Navbar, Nav} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faGithub} from '@fortawesome/free-brands-svg-icons';

const PROJECT = process.env.REACT_APP_PROJECT_REPOSITORY_URL;

const Dashboard = () => {

    return (
        <Navbar bg="dark" variant="dark">
          <Navbar.Brand href="#home">
            Curve Labs Voting App
          </Navbar.Brand>
          <Nav className={'ml-auto mr-2'}>
              <a style={{color: 'white'}} 
                target="_blank" 
                rel="noopener noreferrer" 
                href={PROJECT}>
                  <FontAwesomeIcon icon={faGithub} />
                </a>
          </Nav>
        </Navbar>
    )

}

export default Dashboard;