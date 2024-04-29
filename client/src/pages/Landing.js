import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAppContext } from '../context/appContext';
import main from '../assets/images/main.svg';
import Wrapper from '../assets/wrappers/LandingPage';
import Logo from '../components/Logo';

function Landing() {
  const { user } = useAppContext();
  return (
    <>
      {user && <Navigate to='/' />}
      
      <Wrapper>
        <nav>
          <Logo />
        </nav>
        <div className="container page">

          <div className="info">
            <h1>A Job <span>Tracking</span> App</h1>
            <h4>Track and manage all your job applications in one place.</h4>
            <p>
            We're right there with you in the job seeker's trenches. We understand the rollercoaster of emotions, the uncertainty,
             and the relentless pursuit of opportunities. Our app is our way of extending a helping hand in this journey, 
             offering you the organization and reassurance you need in a landscape where both are scarce. Keep pushing forward, 
             keep sending out those applications. It may feel discouraging at times, but remember, 
             every application is a step closer to your goal. As fellow seekers ourselves, we know the struggle intimately. 
             But together, we can navigate through it. <strong>"We believe in the timeless wisdom of Vince Lombardi: 'The only place where success comes before work is in the dictionary.'"</strong>
            </p>
            <Link to='/register' className='btn btn-hero'>
              Login/Register
            </Link>
          </div>

          <img src={main} alt="job hunt" className='img main-img'></img>

        </div>
      </Wrapper>
    </>
  );
}

export default Landing 