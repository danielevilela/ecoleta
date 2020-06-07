import React from 'react';
import { FiLogIn } from 'react-icons/fi';
import logo from '../../assets/logo.svg';
import './styles.css';
import { Link } from 'react-router-dom';


const Home:React.FC = () => {
    return (
        <div id="page-home">
            <div className="content">
                <header>
                    <img src={logo} alt="Ecoleta"/>
                </header>
                
                <main>
                    <h1>Your marketplace of Recycling Centres.</h1>
                    <p>We help you to find bins or drop-off locations that are located around the province.</p>

                    <Link to="/create-point">
                        <span><FiLogIn /></span>
                        <strong> Register a new collection point</strong>
                    </Link>
                </main>
            </div>
        </div>
    );
};

export default Home;