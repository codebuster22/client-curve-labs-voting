const SafeProposalContainer = (props) => {
    return (
      <div className={'safe-proposal-container'} style={{maxWidth: '35rem'}}>
        {props.children}
      </div>
    )
  }

export default SafeProposalContainer;