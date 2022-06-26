import {createStore} from 'redux';
import createRootReducer from '../reducers/rootReducer';

let initialState = {
	
};

let store;

export default function configureStore(){
	store = createStore(createRootReducer(), initialState);
	return store;
}