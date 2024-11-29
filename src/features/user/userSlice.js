import { getAddress } from '../../services/apiGeocoding';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

function getPosition() {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}
/* Note: this is an async function  which means that we cannot just call this function directly inside a Redux reducer  BCZ REMEMBER Redux is by nature completly synchronous  and so that's why we now need to talk about Thunks again. all what u need to know is that Thunk is a middleware that sits between the dispatching and the reducer itself , So it will do something to dispatched action before updating the store.

Now back then when we wanted to use Thunks with Redux Toolkit we manually created our own action creator and placed the Thunk in there , so instead of using RTK native way if creating a Thunk, but now let's actually do that

and now in order to use Thunk we'll use the createAsyncThunk function */
//async function fetchAddress() {}

/*Note: This createAsyncThunk recive two things , FIRST we need to pass the action name (in this case : 'user/fetchAddress') and then second , we need to pass in an async function that will return the payload for the reducer later , so this function need to retun the promise and so an async function is ideal here */

/* Note: now this fetchAddress here will actually become the action creator function that we will later call in or code and so let's export this one as well */
export const fetchAddress = createAsyncThunk(
  'user/fetchAddress',
  async function () {
    // 1) We get the user's geolocation position
    const positionObj = await getPosition();
    const position = {
      latitude: positionObj.coords.latitude,
      longitude: positionObj.coords.longitude,
    };

    // 2) Then we use a reverse geocoding API to get a description of the user's address, so we can display it the order form, so that the user can correct it if wrong
    const addressObj = await getAddress(position);
    const address = `${addressObj?.locality}, ${addressObj?.city} ${addressObj?.postcode}, ${addressObj?.countryName}`;

    // 3) Then we return an object with the data that we are interested in

    /* This data that we retun here will become the payload of the fulfilled state */
    return { position, address };
  },
);

/* RECAP : So this time we used RTK way of creating a Thunk function , so we called createAsyncThunk function right here where we passed in the action type name ('user/fetchAddress') which we will never manually use but still redux needs this internally and then as a second argument we pass in the actual Thunk function so the Code that we want to execute as soon as this action here will be dispatched ,
Now what special about this is that this createAsyncThunk will basically produce 3 additional action type, so one for the depending promise state ,one for the fulfilled state , and one for the rejected state , and so now we need to handle these cases separatly back in our reducers and so this how we then connect this Thunk "GetPosition" with our reducers down here   */

const initialState = {
  username: '',
  status: 'idle',
  position: {},
  address: '',
  error: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateName(state, action) {
      state.username = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddress.pending, (state, action) => {
        state.status = 'loading';
      })
      .addCase(fetchAddress.fulfilled, (state, action) => {
        state.position = action.payload.position;
        state.address = action.payload.address;
        state.status = 'idle';
      })
      .addCase(fetchAddress.rejected, (state, action) => {
        state.status = 'error';
        state.error =
          'There was a problem getting your address, make sure to fill this field!';
      });
  },
});

export const { updateName } = userSlice.actions;
export default userSlice.reducer;
