import React, { Component, Fragment } from 'react';
import LazyLoad from 'react-lazyload';
import { Howl } from "howler";
import './App.css';
import '@fortawesome/fontawesome-free/css/all.css'
import '@fortawesome/fontawesome-free/js/all.js'
import SingleTrack from './SingleTrack';
import axios from 'axios';
import jsmediatags from 'jsmediatags';

class Tracks extends Component {

  constructor(props) {
    super(props);
    this.state = {
      audio: [],
      tracks: [],
      finalTracks: [],
      playing: [],
      tracksLoaded: false
    }
  }

  componentDidMount() {
    axios.get('music.json')
      .then(res => this.setState({ audio: res.data }, () => this.getTracks()))
  }

  getTracks = () => {
    let tracks = [];
    for (let i = 0; i < this.state.audio.length; i++) {
      let currentTrack = new Howl({
        src: "tracks/" + this.state.audio.slice(i, i + 1),
        html5: true
      });
      let duration, minutes, seconds, newTrack = {};
      currentTrack.on('load', () => {
        duration = currentTrack.duration();
        minutes = Math.floor(duration / 60);
        seconds = Math.floor(duration - minutes * 60);
        minutes = ("0" + minutes).slice(-2);
        seconds = ("0" + seconds).slice(-2);
        newTrack["minutes"] = minutes;
        newTrack["seconds"] = seconds;
        newTrack["id"] = i;
        tracks.push(newTrack);
        newTrack = {};
        if (tracks.length === this.state.audio.length) {
          this.setState({
            tracks
          }, () => {
            this.readTags();
          });
        }        
      });
    }
  }

  readTags = () => {
    let tracks = this.state.tracks.slice();
    let finalTracks = [], playing = [], urls = [];
    for (var i = 0; i < this.state.audio.length; i++) {
      urls.push('http://localhost:3000/tracks/' + `${this.state.audio[i]}`);
    }
    let promises = urls.map(url => this.getTags(url));
    Promise.all(promises).then(results => {
      for (var i = 0; i < results.length; i++) {
        let track = tracks[i];  
          let title = results[i].tags.title;
          let artist = results[i].tags.artist;
          let currentTrackPicture;
          if (results[i].tags.picture) {
            const { data, type } = results[i].tags.picture;
            const byteArray = new Uint8Array(data);
            const blob = new Blob([byteArray], { type });
            currentTrackPicture = URL.createObjectURL(blob);
          }       
          track["title"] = title;
          track["artist"] = artist;
          track["picture"] = currentTrackPicture;
          finalTracks.push(track);
          playing.push(false);
          if (finalTracks.length === this.state.audio.length) {
            this.setState({ finalTracks, playing }, () => {
              this.setState({
                tracksLoaded: true
              })
            })
          }        
      }
    }).catch(err=> console.log('One of the requests failed'));    
  }

getTags = (url) => {      
  return new Promise((resolve, reject) => {
      new jsmediatags.Reader(url)
        .read({
          onSuccess: (tag) => {                
            resolve(tag);
          },
          onError: (error) => {                
            reject(error);
          }
        });
    });
}
  consoleState = () => {
    console.log(this.state);
  }

  handleClick = (e) => {
      this.props.appCallback(e.target.value);
  }  

  render() {
    return (
      <div className="tracks">
        {this.state.finalTracks.length ?
          <Fragment>
            {this.state.tracksLoaded ? this.state.finalTracks.slice(0,20).map((item, index) =>
              <LazyLoad key={index}>
                  <SingleTrack 
                  onClick={this.handleClick}
                  index = {index} 
                  title = {item.title} 
                  artist = {item.artist} 
                  picture = {item.picture}
                  minutes = {item.minutes} 
                  seconds = {item.seconds}
                  key = {index}
                  isPlaying = {this.state.playing[index]} /> 
              </LazyLoad>
            ) : null }
          </Fragment>
          : <div className="tracks-loading">Loading...</div> }
      </div>      
    );
  }

}

export default Tracks;
