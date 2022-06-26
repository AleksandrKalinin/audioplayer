let actions = {
	loadTracks: function(tracks) {
		return {
			type: 'LOAD_TRACK',
			payload: tracks
		}
	},
	selectTrack: function(id) {
		return {
			type: 'SELECT_TRACK',
			payload: id
		}
	},
	changePlayingState: function(value) {
		return {
			type: 'CHANGE_PLAYING_STATE',
			payload: value
		}
	},
	changeProgressState: function(value) {
		return {
			type: 'CHANGE_PROGRESS_STATE',
			payload: value
		}
	}	
}

export default actions;