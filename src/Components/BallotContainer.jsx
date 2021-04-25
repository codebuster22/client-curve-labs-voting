const BallotContainer = (props) => {
    return (
      <div className={'ballot-container d-flex flex-wrap justify-content-center'} >
        {props.children}
      </div>
    )
}

export default BallotContainer;