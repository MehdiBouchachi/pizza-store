/* READ: many of the state management principles  that we have learned throughout this course still applay here to modeling state in Redux for example the fact that whenever possible we shouled always derive state and si that's the reson why we are not storing for example , "the total cart price here and numberItems" like this : 

 const intialState = {
     cart : [],
     totalPrice:0,
     numItem:0
      }  

however w can easily derive these from the cart array itself and so then we don't need to create "these" bcz it's just will create more problems bcz then we wouled have to keep the in sync while we are updating the cart      
     
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cart: [],

  /* cart: [
    {
      pizzaId: 12,
      name: 'Mediterranean',
      quantity: 2,
      unitePrice: 16,
      totalPrice: 32,
    },
  ], */
};
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action) {
      state.cart.push(action.payload);
    },
    deleteItem(state, action) {
      state.cart = state.cart.filter((item) => item.pizzaId !== action.payload);
    },
    increasItemQuantity(state, action) {
      const item = state.cart.find((item) => item.pizzaId === action.payload);
      item.quantity++;
      item.totalPrice = item.unitPrice * item.quantity;
    },
    decreasItemQuantity(state, action) {
      const item = state.cart.find((item) => item.pizzaId === action.payload);
      item.quantity--;
      item.totalPrice = item.quantity * item.unitPrice;
      /* NOTE: using new trick in redux to access to some reducer */
      if (item.quantity === 0) cartSlice.caseReducers.deleteItem(state, action);
    },
    clearCart(state) {
      state.cart = [];
    },
  },
});

export const {
  addItem,
  deleteItem,
  increasItemQuantity,
  decreasItemQuantity,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;

/* this is now a redux selector function and the recommendation and the standard is these functions start with the GET keyword  and we have them all in the central place in the cartSlice file bcz we will actually need this operation later on in another component and so then all we will need to do is to take this function here and just reuse it  */

export const getCart = (state) => state.cart.cart;
export const getUsername = (state) => state.user.username;
export const getTotalCartQuantity = (state) =>
  state.cart.cart.reduce((sum, item) => sum + item.quantity, 0);

export const getTotalCartPrice = (state) =>
  state.cart.cart.reduce((sum, item) => sum + item.totalPrice, 0);
/* NOTE: having these selector functions here like this might cuase performance issues in larger applications and so if you are really  serious about redux  u can look in Reselect lib which will allow us to uptimize these selectors lib name : "reselect" */

export const getCurrentQuantityById = (id) => (state) =>
  state.cart.cart.find((item) => item.pizzaId === id)?.quantity ?? 0;
