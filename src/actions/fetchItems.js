import actions from './index.js';
import axios from 'axios';

function fetchItems()  {
       axios.get('../../music.json')
        .then(res => {
            const tracks = res.data;
            console.log(tracks);
            actions.loadTracks(tracks)
        })
};

export default fetchItems;