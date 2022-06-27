import React,{Component} from 'react';
import './App.css';
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/js/all.js';

import {bindActionCreators} from 'redux';
import actions from './actions/index';
import store from './store/index';

import {connect} from 'react-redux';
import WaveSurfer from 'wavesurfer.js';

class SingleTrack extends Component {

  constructor(props){
    super(props);
    this.state = {
      playing: null,
      currentId: 0
    }
    this.waveRef = React.createRef();
  }

  componentDidMount(){
    this.setState({
      playing: this.props.store.playing,
      currentId: this.props.store.currentId
    }, () => this.drawAnimation());
  }

  componentDidUpdate(prevProps){
    console.log("previos Props", prevProps);
    console.log("current Props", this.props.store);
    let wavesurfer = this.state.wavesurfer;

    if (prevProps.store.progress !== this.props.store.progress && this.props.store.currentId === this.props.index) {
      if (prevProps.store.progress > this.props.store.progress) {
        wavesurfer.skip(this.props.store.progress - prevProps.store.progress);
      } else {
        wavesurfer.skip(this.props.store.progress - prevProps.store.progress);
      }
    }
    if (this.props.store.playing === false && 
        this.props.store.currentId === this.props.index && 
        prevProps.store.currentId === this.props.store.currentId &&
        prevProps.store.playing === true) {
      wavesurfer.pause();
    }

    if(prevProps.store.currentId !== this.props.store.currentId){ 
      wavesurfer.stop();
      this.setState({
        currentId: this.props.store.currentId,
        wavesurfer
      }, () => {
        if (this.props.store.currentId === this.props.index) {
          wavesurfer.play();
        }
      })
    }

    if(prevProps.store.playing !== this.props.store.playing){ 
      this.setState({
        playing: this.props.store.playing
      })
    }  

    if (this.props.store.playing === false && this.props.store.progress > 0) {
      wavesurfer.pause();
    } else if (this.props.store.playing === true && this.props.store.currentId === this.props.index) {
      wavesurfer.play();
    }
  } 

  fireEvent = () => {
    console.log(this.props.store.progress);
  }


  selectTrack = (id) => {
    let wavesurfer = this.state.wavesurfer;
    wavesurfer.play();
    if (this.props.store.playing && this.props.store.currentId === id) {
      wavesurfer.pause();
    }   

    if (this.props.store.currentId !== id && this.props.store.playing === true) {
      this.props.actions.selectTrack(id);
      wavesurfer.play();
    } else {
      this.props.actions.changePlayingState(!this.props.store.playing);
      this.props.actions.selectTrack(id);
    }
    this.setState({
      wavesurfer
    })          
  }

  drawAnimation = () => {

    var wavesurfer = WaveSurfer.create({
        container: this.waveRef.current,
        waveColor: '#DDDDDD',
        progressColor: '#5E7EDB'
    });
    wavesurfer.on('ready', function () {
      wavesurfer.setVolume(0);
      wavesurfer.toggleInteraction();
      wavesurfer.setHeight(30);
    });
    wavesurfer.load(`tracks/${this.props.index + 1}.mp3`);
    this.setState({
      wavesurfer
    })
  }  

  render(){
    return (
        <div className="tracks__item tracks-item" onClick = {this.selectTrack.bind(this, this.props.index)}>
          <div className="tracks-item__icon tracks-icon">
            <img src={this.props.picture} className="tracks-icon__image" alt=""/>
              {this.state.playing && this.state.currentId === this.props.index ? (
                <span className="tracks-icon__play tracks-play" >
                  <i className="fas fa-pause"></i>
                </span>
              ) : null}
              {!this.state.playing || !(this.state.currentId === this.props.index) ? (
                <span className="tracks-icon__play tracks-play" >
                  <i className="fas fa-play"></i>
                </span>
              ) : null}                         
          </div>
          <div className="tracks-main">
            <div className="tracks-item__description tracks-description">
              <div className="tracks-description__main">
                <span className="tracks-description__number tracks-number">{this.props.index + 1}</span>
                <p className="tracks-description__name tracks-name">
                  <span className="tracks-description__artist tracks-artist">{this.props.artist}</span>
                  <span className="tracks-spacing"> - </span>
                  <span>{this.props.title}</span>
                </p>                    
              </div>
              <span className="tracks-description__length">{this.props.minutes}:{this.props.seconds}</span>
            </div>
            <div className="tracks-waveform" id={`waveform${this.props.index}`} ref={this.waveRef}></div>          
          </div>
        </div>
    );
  }

}

function mapStateToProps(state){
  return {store: state.reducer};
}

function mapDispatchToProps(dispatch) {
    return { actions: bindActionCreators(actions, dispatch)}
}


export default connect(mapStateToProps, mapDispatchToProps)(SingleTrack);
