import { Form, redirect, useActionData, useNavigation } from 'react-router-dom';
import { createOrder } from '../../services/apiRestaurant';
import Button from '../../ui/Button';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart, getCart, getTotalCartPrice } from '../cart/cartSlice';
import EmptyCart from '../cart/EmptyCart';
import store from '../../store';
import { formatCurrency } from '../../utils/helpers';
import { useState } from 'react';
import { fetchAddress } from '../user/userSlice';
// https://uibakery.io/regex-library/phone-number
const isValidPhone = (str) =>
  /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/.test(
    str,
  );

function CreateOrder() {
  const {
    username,
    status: addressStatus,
    position,
    address,
    error: errorAddress,
  } = useSelector((state) => state.user);

  const isLoadingAddress = addressStatus === 'loading';
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  /* CONCEPT: now in this CreateOrder component that is wired up with the action (the component is connected with the action createOrderAction in route )  so we can now access to the data that is returened from the action , it's yet another custom hook  useActionData*/
  const dispatch = useDispatch();
  const formErrors = useActionData();
  const [withPriority, setWithPriority] = useState(false);
  const cart = useSelector(getCart);
  const totalCartPrice = useSelector(getTotalCartPrice);
  const priorityPrice = withPriority ? totalCartPrice * 0.2 : 0;
  const totalPrice = totalCartPrice + priorityPrice;
  if (!cart.length) return <EmptyCart />;

  return (
    <div className="px-4 py-6">
      <h2 className="mb-8 text-xl font-semibold">Ready to order? Lets go!</h2>

      {/* <Form method="POST" action="/order/new"> 
      NOTE:  
          it also work like this but its better to write it like the below one bcz it's not neccary to write the action path bcz by ddefault react-router will simply match the closet route so there's no need to write /order/new :)*/}
      <Form method="POST">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">First Name</label>
          <input
            className="input grow"
            type="text"
            name="customer"
            defaultValue={username}
            required
          />
        </div>
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">Phone number</label>
          <div className="grow">
            <input className="input w-full" type="tel" name="phone" required />
            {formErrors?.phone && (
              <p className="mt-2 rounded-md bg-red-100 text-center text-sm text-red-700">
                {' '}
                {formErrors.phone}{' '}
              </p>
            )}
          </div>
        </div>
        <div className="relative mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">Address</label>
          <div className="grow">
            <input
              className="input w-full"
              type="text"
              name="address"
              disabled={isLoadingAddress}
              defaultValue={address}
              required
            />
            {addressStatus === 'error' && (
              <p className="mt-2 rounded-md bg-red-100 text-center text-sm text-red-700">
                {' '}
                {errorAddress}{' '}
              </p>
            )}
          </div>
          {!position.latitude && !position.longitude && (
            <span className="absolute right-[3px] top-[35px] z-50 sm:right-[3px] sm:top-[3px] md:right-[5px] md:top-[5px]">
              <Button
                disabled={isLoadingAddress}
                type={'small'}
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(fetchAddress());
                }}
              >
                Get posistion
              </Button>
            </span>
          )}
        </div>
        <div className="mb-12 flex items-center gap-5">
          <input
            className="h-6 w-6 accent-yellow-400 focus:outline-none focus:ring focus:ring-yellow-400 focus:ring-offset-2"
            type="checkbox"
            name="priority"
            id="priority"
            value={withPriority ? 'on' : 'off'}
            onChange={(e) => setWithPriority(e.target.checked)}
          />
          <label htmlFor="priority">Want to yo give your order priority?</label>
        </div>
        <input type="hidden" name="cart" value={JSON.stringify(cart)} />{' '}
        <input
          type="hidden"
          name="position"
          value={
            position.longitude && position.latitude
              ? `${position.latitude}, ${position.longitude}`
              : ''
          }
        />
        {/* we basically pass that cart into hidden input, so we converted this cart to a string and assign that to the value of this hidden input field and the reason why we had to do that is bcz we are not able to get the data from redux in the action   */}
        <div>
          <Button type="primary" disabled={isSubmitting || isLoadingAddress}>
            {isSubmitting
              ? 'Placing order...'
              : `Order now from ${formatCurrency(totalPrice)}`}
          </Button>
        </div>
      </Form>
    </div>
  );
}

/* NOTE:
           by defaul we call the function as action , now as soon we submit our special form here , that will than create a request that will basically be interspted by this action function as soon as we have it connected with react router ,  so whenever this FORM get submited , behind the scence react-router will than call this action function and then will pass the request that was submited ,so we can access to request from the action :) 
*/

/* CONCEPT: we want aslo our cart data into this action so the cart is on top of component but we aslo want now o basically submit it to the FORM so we can then access to it in the action 

Note this cart later on will comes from redux
so thnakfully for us theres a nice way  of actually getting some data into the action without it being a form field  so it will being a hidding input 
*/

export async function action({ request }) {
  const formData = await request.formData();
  /* NOTE: 
  this formData function is provided by the browser (it's just reqular web api) */
  const data = Object.fromEntries(formData);
  //console.log(data);

  /* CONCEPT: we need to model it a littel bit , bcz the priority should be always exist in the data that we will submit and should be TRUE or FALSE , ando also the cart should be converted back to an OBJECT */

  const order = {
    ...data,
    cart: JSON.parse(data.cart),
    priority: data.priority === 'on',
  };
  // so the data now is in the shape that we want to be , and now we can use it to create a new order
  //console.log(order);
  const errors = {};
  if (!isValidPhone(order.phone))
    errors.phone =
      'Please give hs your correct phone number. we might need it to contact you.';
  if (Object.keys(errors).length > 0) return errors;

  const newOrder = await createOrder(order); //then we want to immediatly redirect the page to the order/id
  /* NOTE: we cannot use the navigate function bcz it's comes from the useNavigate hook and we can't use the hooks inside this function bcz hooks can only be called inside the components so here we need to use another fucntion which is called "redirect"   */
  store.dispatch(clearCart());
  return redirect(`/order/${newOrder.id}`);
}
/* NOTE: now we need to connect the action to the route so let's go to our route (in app.jsx file) */
export default CreateOrder;
//
