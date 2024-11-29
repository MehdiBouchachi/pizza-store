import { useState } from 'react';
import Button from '../../ui/Button';
import { useDispatch } from 'react-redux';
import { updateName } from './userSlice';
import { useNavigate } from 'react-router-dom';

function CreateUser() {
  const [username, setUsername] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  /* CONCEPT: well we do it with this state this way , bcz we are temporarliy storing the username right in the component itslef bcz it's a very bad practice to basically  connect an input field right to the redux store , so as we change the username here , so as we type new input ; here we shouled really update a local state variable an not alwyas update the redux store 
  instad we shouled only do that as soon as we actualy submit this form so basically as soon as we are done inputting the username so that's here in the handleSubmit function  */

  function handleSubmit(e) {
    e.preventDefault();

    if (!username) return;
    dispatch(updateName(username));
    /* now we need to do is redirect to the menu so that where we need the navigate function */
    navigate('/menu');
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="mb-4 text-sm text-stone-600 md:text-base">
        👋 Welcome! Please start by telling us your name:
      </p>

      <input
        className="input mb-8 w-72"
        type="text"
        placeholder="Your full name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      {username !== '' && (
        <div>
          <Button type="primary">Start ordering</Button>
        </div>
      )}
    </form>
  );
}

export default CreateUser;
