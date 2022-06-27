import React,{Component} from 'react';
import './App.css';
import '@fortawesome/fontawesome-free/css/all.css'
import '@fortawesome/fontawesome-free/js/all.js'
import jsmediatags from "jsmediatags";
import { Howl } from "howler";
import axios from 'axios';

import {bindActionCreators} from 'redux';
import actions from './actions/index';

import {connect} from 'react-redux';

class Player extends Component {

  constructor(props) {
    super(props);
    this.state = {
      audio: [],
      soundVolume: 5,
      playing: false,
      muted: false,
      currentTrack: null,
      currentTrackLength: null,
      currentTrackInfo: null,
      currentTrackPicture: null,
      currentId: 4,
      order: "consecutive",
      duration: 0,
      minutes: "00",
      seconds: "00",
      currentDuration: 0,
      currentMinutes: "00",
      currentSeconds: "00",
      tracksVisible: true,
      interval: null,
      progress: 0,
      decodingFinished: false
    };
  }

  componentDidMount(){
    this.setState({
      currentId: this.props.store.currentId
    }, () => {
      axios
        .get("music.json")
        .then((res) =>
          this.setState({ audio: res.data }, () =>
            this.callFunctions(this.props.store.currentId)
          )
        );       
    }) 
  }

  componentDidUpdate(prevProps){
    let currentTrack = this.state.currentTrack;
    if(prevProps.store.playing !== this.props.store.playing) { 
      this.setState({playing: this.props.store.playing})
      if (this.props.store.playing === false) {
        currentTrack.pause();
      } else {
        let interval = this.state.interval;
        currentTrack.play();
        interval = setInterval(() => this.startCycle(), 1000);
        this.setState({ interval });
      }
    }    

    if(prevProps.store.currentId !== this.props.store.currentId) { 
      if (currentTrack) {
        currentTrack.pause();
      }   
      this.setState({
        currentTrack
      }, () => this.callFunctions(this.props.store.currentId));
    }
  }

  callFunctions = () => {
    let id = this.props.store.currentId;
    let currentTrack = new Howl({
      src: "tracks/" + this.state.audio.slice(id, id + 1),
      html5: true,
      volume: this.state.soundVolume / 10
    });
    var duration, minutes, seconds, currentMinutes, currentSeconds;
    currentTrack.on("load", () => {
      duration = currentTrack.duration();
      minutes = Math.floor(duration / 60);
      seconds = Math.floor(duration - minutes * 60);
      minutes = ("0" + minutes).slice(-2);
      seconds = ("0" + seconds).slice(-2);
      currentMinutes = "00";
      currentSeconds = "00";
      this.setState({ minutes, seconds, duration, currentTrack }, () => {
        this.setState({ decodingFinished: true });        
        if (this.props.store.playing) {
          this.continuePlay();
        } 
      });
    });
    this.readTags(id);
  };

  resetState = () => {
    this.setState({
      progress: 0,
      currentMinutes: "00",
      currentSeconds: "00"
    })
  }

  readTags = (id) => {
    let track = this.state.audio[id];
    jsmediatags.read(
      "http://localhost:3000/tracks/" + `${this.state.audio[id]}`,
      {
        onSuccess: (tag) => {
          this.setState({ currentTrackInfo: tag }, () => {
            this.decodeTrackInfo();
          });
        },
        onError: (error) => {
          console.log(":(", error.type, error.info);
        },
      }
    );
  };

  decodeTrackInfo = () => {
    let title = this.state.currentTrackInfo.tags.title;
    let artist = this.state.currentTrackInfo.tags.artist;
    let currentTrackPicture;
    if (this.state.currentTrackInfo.tags.picture) {
      const { data, type } = this.state.currentTrackInfo.tags.picture;
      const byteArray = new Uint8Array(data);
      const blob = new Blob([byteArray], { type });
      currentTrackPicture = URL.createObjectURL(blob);
    }
    this.setState({
      currentTrackPicture,
      currentTrackTitle: title,
      currentTrackArtist: artist
    })
  };

  playMusic = () => {
    let currentTrack = this.state.currentTrack;
    let interval = this.state.interval;
    if (this.props.store.playing) {
      currentTrack.pause();
      this.props.actions.changePlayingState(false);
      clearInterval(interval);
      this.setState({ interval });
    } else {
      currentTrack.volume(this.state.soundVolume / 10);
      currentTrack.play();
      interval = setInterval(() => this.startCycle(), 1000);
      this.setState({ interval });
      this.props.actions.changePlayingState(true);
    }
    this.props.actions.changePlayingState(!this.props.store.playing);
    this.setState({currentTrack});
  };

  continuePlay = () =>{
    let currentTrack = this.state.currentTrack;
    if (this.props.store.playing) {
      currentTrack.stop();
      
    }
    let interval = this.state.interval;
    clearInterval(interval);
    currentTrack.play();
    if (this.props.store.playing) {
      interval = setInterval(() => this.startCycle(), 1000);
    }    
    this.setState({ interval });    
  }

  changeVolume = (e) => {
    let currentTrack = this.state.currentTrack;
    currentTrack.volume(e.target.value / 10);
    this.setState({ soundVolume: e.target.value, currentTrack });
  };

  nextTrack = () => {
    let currentTrack = this.state.currentTrack;
    currentTrack.volume(this.state.volume / 10);
    currentTrack.stop();
    
    if (this.props.store.currentId < this.state.audio.length - 1) {
      this.props.actions.selectTrack(this.props.store.currentId + 1);
    } else {
       this.props.actions.selectTrack(0);
    }
    this.setState({ currentTrack, decodingFinished: false }, () => {
      this.resetState();
    });
  };

  prevTrack = () => {
    let currentTrack = this.state.currentTrack;
    currentTrack.volume(this.state.volume / 10);
    currentTrack.stop();
    
    if (this.props.store.currentId > 0) {
      this.props.actions.selectTrack(this.props.store.currentId - 1);
    } else {
      this.props.actions.selectTrack(this.state.audio.length - 1);
    }
    this.setState({ currentTrack, decodingFinished: false }, () => {
      this.resetState();
    });
  };

  muteSound = () => {
    let currentTrack = this.state.currentTrack;
    if (this.state.muted) {
      currentTrack.mute(false);
    } else {
      currentTrack.mute(true);
    }
    this.setState({
      muted: !this.state.muted,
      currentTrack,
    });
  };

  startCycle = () => {
    this.incTime();
    this.updateProgress();
  };

  updateProgress = () => {
    let time = Math.round(this.state.currentTrack.seek());
    let duration = Math.round(this.state.currentTrack.duration());
    let progress = ((time / duration) * 100).toFixed(2);
    this.setState({ progress });
    //this.props.actions.changeProgressState(progress);
  };

  incTime = () => {
    let currentDuration = Math.round(this.state.currentTrack.seek());
    let currentMinutes = Math.floor(currentDuration / 60);
    let currentSeconds = Math.floor(currentDuration - currentMinutes * 60);
    currentMinutes = ("0" + currentMinutes).slice(-2);
    currentSeconds = ("0" + currentSeconds).slice(-2);
    this.setState({ currentSeconds, currentMinutes, currentDuration });
    if (currentDuration === this.state.currentTrack.duration()) {
      let currentTrack = this.state.currentTrack;
      currentTrack.stop(); 

      if (this.props.store.currentId < this.state.audio.length - 1) {
        this.props.actions.selectTrack(this.props.store.currentId + 1);
      } else {
        this.props.actions.selectTrack(0);
      }
      this.setState({ currentTrack, decodingFinished: false }, () => {
        this.resetState();
        this.callFunctions(this.props.store.currentId);
      });      
    }
  };

  setSeek = (e) => {
    let currentTrack = this.state.currentTrack;
    let duration = Math.round(this.state.currentTrack.duration());
    let seek = (e.target.value * duration) / 100;
    currentTrack.seek(seek);
    console.log("seek", Math.round(seek));
    this.setState({ currentTrack, progress: e.target.value }, () => {
      this.incTime();
      this.props.actions.changeProgressState(Math.round(seek));
      console.log(this.state.progress);
    });
  };

  render(){
    return (
      <div className="player">
        <div className="player__visualizer player-visualizer">
          <div className="player-visualizer__waveform" id="waveform"></div>
        </div>
        <div className="player__top player-top">
          <span className="player-top__time">{this.state.currentMinutes}.{this.state.currentSeconds}</span>
          <div className="player-top__progress player-progress">
              <input
                className="player-progress__input"
                min="0"
                max="100"
                type="range"
                value={this.state.progress}
                onChange={this.setSeek}
              />
          </div>
          <span className="player-top__time">{this.state.minutes}.{this.state.seconds}</span>
        </div>
        <div className="player-main">
          <div className="player-left">
            <div className="player-info player__info">
              <div className="player-info__icon player-icon">
                  {this.state.currentTrackPicture ? (
                    <img src={this.state.currentTrackPicture} className="player-icon__picture" alt="" />
                  ) : null}              
              </div>
              <div className="player-info__description player-description">
                <p className="player-description__name">{this.state.currentTrackTitle}</p>
                <p className="player-description__artist">{this.state.currentTrackArtist}</p>
              </div>
            </div>
            <div className="player__controls player-controls">
              <div className="player-controls__navigation">
                <div className="player-controls__item player-controls__left" onClick={this.prevTrack}><i className="fas fa-backward"></i></div>
                {!this.props.store.playing ? <div className="player-controls__item player-controls__play" onClick={this.playMusic}><i className="fas fa-play"></i></div> : null}
                {this.props.store.playing ? <div className="player-controls__item player-controls__play" onClick={this.playMusic}><i className="fas fa-pause"></i></div> : null}
                <div className="player-controls__item player-controls__right" onClick={this.nextTrack}><i className="fas fa-forward"></i></div>         
              </div>
            </div>        
          </div>
          <div className="player-controls__volume player-volume">
            <div className="player-controls__item player-volume__item"><i className="fas fa-volume-up"></i></div>
                      <input
                        className="player-controls__audio"
                        value={this.state.soundVolume}
                        min="0"
                        max="10"
                        onChange={this.changeVolume}
                        type="range"
                      />        
          </div>      
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


export default connect(mapStateToProps, mapDispatchToProps)(Player);
