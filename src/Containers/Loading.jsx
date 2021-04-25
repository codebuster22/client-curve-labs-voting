import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCircleNotch} from '@fortawesome/free-solid-svg-icons'

const Loading = () => 
    <header className={'App-header'} >
        <FontAwesomeIcon className={'App-logo logo-spin'} icon={faCircleNotch} />
        <h3 className={'mt-5'}>
            Opening gateway to the future. Please wait...
        </h3>
    </header>

export default Loading