let initialState = {
	"currentId": 0,
	"playing": false,
	"progress": 0		
};

let reducer = (state = initialState, action) => {
	switch(action.type){
		case 'LOAD_TRACKS':
			return {
				...state,
				items: action.payload
			}
		case 'SELECT_TRACK':
			return {
				...state,
				currentId: action.payload }
		case 'CHANGE_PLAYING_STATE':
			return {
				...state,
				playing: action.payload }
		case 'CHANGE_PROGRESS_STATE':
			return {
				...state,
				progress: action.payload }		
		default: return state;		
	}
}

export default reducer;