import { useState } from 'react';
import reactLogo from './assets/react.svg';
import './App.css';
import FileUpload from './Fileupload';
import FAQ from './Faq';
import Contact from './Contact';
import Developers from './Developers';
import { Button } from '@mui/material';
import Home from './Home';


function App() {
  const [currentComponent, setCurrentComponent] = useState('home');

  const renderComponent = () => {
    switch (currentComponent) {
      case 'fileupload':
        return <FileUpload />;
      case 'faq':
        return <FAQ />;
      case 'developers':
        return <Developers />;
      case 'contact':
        return <Contact />;
      default:
        return <Home />;
    }
  };

  return (
    <>
      <div className="menu-bar">
        <nav>
          <ul>
            <header className="title" onClick={() => setCurrentComponent('default')} ><strong>KAFRE</strong></header>
            <ul className='menu-items'>
              <div>
                <li>
                  <a href="#get-started" onClick={() => setCurrentComponent('fileupload')} className="spaced-link">Get Started</a>
                  <a href="#about-us" onClick={() => setCurrentComponent('developers')}>Docs</a>
                </li>
              </div>
              <button onClick={() => setCurrentComponent('contact')}><b>Contact Us</b></button>
            </ul>
          </ul>
        </nav>
      </div>
      <div className="container">
        {renderComponent()}
      </div>
    </>

  );
}

export default App;
