import React, { Component, Fragment } from "react";
import "./App.css";
import "@fortawesome/fontawesome-free/css/all.css";
import "@fortawesome/fontawesome-free/js/all.js";
import Tracks from "./Tracks";
import Player from "./Player";
import Mobile from "./Mobile";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  /*
    drawCanvas = () =>{
      let audio = this.state.currentTrack;
      var analyser = Howler.ctx.createAnalyser();
      Howler.masterGain.connect(analyser); 
      analyser.fftSize = 256;
      var bufferLength = analyser.frequencyBinCount;
      console.log(bufferLength);
      var dataArray = new Uint8Array(bufferLength);
      var WIDTH = 370;
      var HEIGHT = 200;
      var barWidth = (WIDTH / bufferLength) * 2.5;
      var barHeight;
      var x = 0;  
          
    }
  
    renderFrame = () => {
      requestAnimationFrame(renderFrame);
      x = 0;
  
      analyser.getByteFrequencyData(dataArray);
  
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
  
      for (var i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];
        
        var r = barHeight + (25 * (i/bufferLength));
        var g = 250 * (i/bufferLength);
        var b = 50;
  
        ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
        ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
  
        x += barWidth + 1;
      }
    }  
  */

  render() {
    return (
      <Fragment>
        <div className="container__wrapper">
          <div className="container">
            <Tracks audio={this.state.audio} appCallback = {this.handleCallback}/>
          </div>
          <Player />
      { /*
        <Mobile />
      */}
        </div>
      </Fragment>
    );
  }
}

export default App;