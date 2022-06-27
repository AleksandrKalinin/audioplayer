import React, { Component, Fragment } from "react";
import "./App.css";
import "@fortawesome/fontawesome-free/css/all.css";
import "@fortawesome/fontawesome-free/js/all.js";
import axios from "axios";
import Marquee from "react-fast-marquee";
import jsmediatags from "jsmediatags";
import { Howl, Howler } from "howler";
import Tracks from "./Tracks";
import SingleTrack from "./SingleTrack";
import Player from "./Player";
import store from './store/index';

class Mobile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      audio: [],
      soundVolume: 2,
      playing: false,
      muted: false,
      currentTrack: null,
      currentTrackLength: null,
      currentTrackInfo: null,
      currentTrackPicture: null,
      currentId: 0,
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
  componentDidMount() {
    axios
      .get("music.json")
      .then((res) =>
        this.setState({ audio: res.data }, () =>
          this.callFunctions(this.state.currentId)
        )
      );
  }

  callFunctions = (id) => {
    let currentTrack = new Howl({
      src: "tracks/" + this.state.audio.slice(id, id + 1),
      html5: true
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
        if (this.state.playing) {
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
    var currentTrackInfo;
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
    const { data, type } = this.state.currentTrackInfo.tags.picture;
    const byteArray = new Uint8Array(data);
    const blob = new Blob([byteArray], { type });
    const currentTrackPicture = URL.createObjectURL(blob);
    this.setState({
      currentTrackPicture,
      currentTrackTitle: title,
      currentTrackArtist: artist
    })
  };

  playMusic = () => {
    let currentTrack = this.state.currentTrack;
    let interval = this.state.interval;
    if (this.state.playing) {
      currentTrack.pause();
      clearInterval(interval);
      this.setState({ interval });
    } else {
      currentTrack.play();
      interval = setInterval(() => this.startCycle(), 1000);
      this.setState({ interval });
    }
    this.setState({ playing: !this.state.playing, currentTrack });
  };

  continuePlay = () =>{
    let currentTrack = this.state.currentTrack;
    let interval = this.state.interval;
    clearInterval(interval);
    currentTrack.play();
    interval = setInterval(() => this.startCycle(), 1000);
    this.setState({ interval });    
  }

  changeVolume = (e) => {
    Howler.volume(e.target.value / 10);
    this.setState({ soundVolume: e.target.value });
  };

  nextTrack = () => {
    let currentTrack = this.state.currentTrack;
    currentTrack.stop();
    if (this.state.currentId < this.state.audio.length - 1) {
      this.setState({ currentId: this.state.currentId + 1 });
    } else {
      this.setState({ currentId: 0 });
    }
    this.setState({ currentTrack, decodingFinished: false }, () => {
      this.resetState();
      this.callFunctions(this.state.currentId);
    });
  };

  prevTrack = () => {
    let currentTrack = this.state.currentTrack;
    currentTrack.stop();
    if (this.state.currentId > 0) {
      this.setState({ currentId: this.state.currentId - 1 });
    } else {
      this.setState({ currentId: this.state.audio.length - 1 });
    }
    this.setState({ currentTrack, decodingFinished: false }, () => {
      this.resetState();
      this.callFunctions(this.state.currentId);
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
  };

  incTime = () => {
    let currentDuration = Math.round(this.state.currentTrack.seek());
    let currentMinutes = Math.floor(currentDuration / 60);
    let currentSeconds = Math.floor(currentDuration - currentMinutes * 60);
    currentMinutes = ("0" + currentMinutes).slice(-2);
    currentSeconds = ("0" + currentSeconds).slice(-2);
    this.setState({ currentSeconds, currentMinutes, currentDuration });
    if (currentDuration === 0) {
      let currentTrack = this.state.currentTrack;
      currentTrack.stop();      
      if (this.state.currentId < this.state.audio.length - 1) {
        this.setState({ currentId: this.state.currentId + 1 });
      } else {
        this.setState({ currentId: 0 });
      }
      this.setState({ currentTrack, decodingFinished: false }, () => {
        this.resetState();
        this.callFunctions(this.state.currentId);
      });      
    }
  };

  setSeek = (e) => {
    let currentTrack = this.state.currentTrack;
    let duration = Math.round(this.state.currentTrack.duration());
    let seek = (e.target.value * duration) / 100;
    currentTrack.seek(seek);
    this.setState({ currentTrack, progress: e.target.value }, () =>
      this.incTime()
    );
  };

  toggleAudio = () => {
    this.setState({ tracksVisible: !this.state.tracksVisible });
  };

  handleCallback = (childData) =>{
    console.log(childData);
  }

  consoleStore = () => {
    console.log(store.store);
  }

  render() {
    return (
      <Fragment>
          <div className="container">
            <div className="audio">
                <div className="audio__player">
                  <div className="audio__top">
                    <span className="audio__button " onClick={this.toggleAudio}>
                      <i className="fas fa-arrow-left"></i>
                    </span>
                    <span className="audio__button  ">
                      <i className="fas fa-volume-up"></i>
                    </span>
                    <input
                      className="audio__sound-progress"
                      value={this.state.soundVolume}
                      min="0"
                      max="10"
                      onChange={this.changeVolume}
                      type="range" />
                  </div>
                  <div className="audio__canvas"></div>
                  <div className="audio__image">
                    {this.state.currentTrackPicture ? (
                      <img src={this.state.currentTrackPicture} />
                    ) : null}
                  </div>
                  <div className="audio__description">
                    <div className="audio__name">
                      <Marquee className="audio__name-title" hoverToStop={true} loop={false} leading={0} trailing={0} text={this.state.currentTrackTitle} />
                      <p className="audio__name-artist">
                        {this.state.currentTrackArtist}
                      </p>
                      {this.state.currentInfo ? (
                        <Fragment>
                          <p>NARC</p>
                          <p>Mega Drive</p>
                        </Fragment>
                      ) : null}
                    </div>
                    {this.state.decodingFinished ?
                      <div className="audio__progress">
                        <div className="audio__progress-time audio__time">
                          <span className="audio__time-left">
                            {this.state.currentMinutes}.
                            {this.state.currentSeconds}
                          </span>
                          <span className="audio__time-right">
                            {this.state.minutes}.{this.state.seconds}
                          </span>
                        </div>
                        <div className="audio__progress--outer">
                          <input
                            className="audio__progress-bar"
                            value={this.state.progress}
                            min="0"
                            max="100"
                            onChange={this.setSeek}
                            type="range"
                          />
                        </div>
                      </div>
                    : <div className="audio__placeholder">Loading...</div>}
                    <div className="audio__controls">
                      <span className="audio__button audio__button--spaced audio__button-bleak">
                        <i className="fas fa-retweet"></i>
                      </span>
                      <span
                        className="audio__button audio__button--spaced"
                        onClick={this.prevTrack}
                      >
                        <i className="fas fa-backward"></i>
                      </span>
                      {!this.state.playing ? (
                        <span
                          className="audio__button audio__button--spaced"
                          onClick={this.playMusic}
                        >
                          <i className="fas fa-play"></i>
                        </span>
                      ) : null}
                      {this.state.playing ? (
                        <span
                          className="audio__button audio__button--spaced"
                          onClick={this.playMusic}
                        >
                          <i className="fas fa-pause"></i>
                        </span>
                      ) : null}
                      <span
                        className="audio__button audio__button--spaced"
                        onClick={this.nextTrack}
                      >
                        <i className="fas fa-forward"></i>
                      </span>
                      <span className="audio__button audio__button--spaced audio__button-bleak">
                        <i className="fas fa-retweet"></i>
                      </span>
                    </div>
                    <div className="audio__play" onClick={this.consoleState}>
                      <span className="audio__play-icon">
                        <i className="fas fa-retweet"></i> Play in the top bar
                      </span>
                    </div>
                  </div>
                </div>
            </div>
          </div> 
      </Fragment>
    );
  }
}

export default Mobile;