import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faExclamationTriangle} from '@fortawesome/free-solid-svg-icons'

const ErrorPage = ({message}) => 
    <header className={'App-header'} >
        <FontAwesomeIcon className={'App-logo'} icon={faExclamationTriangle} />
        <h3 className={'mt-5'}>
            {message}
        </h3>
    </header>

export default ErrorPage