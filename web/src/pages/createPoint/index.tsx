import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import api from '../../services/api';
import axios from 'axios';
import { LeafletMouseEvent } from 'leaflet';
import Dropzone from '../../components/Dropzone';

import './styles.css';

import logo from '../../assets/logo.svg';

interface Item {
    id: number;
    title: string;
    image_url: string;
}


const CreatePoint = () => {
    const[items, setItems] = useState<Item[]>([]);
    const[ufs, setUfs] = useState<string[]>([]);    
    const[cities, setCities] = useState<string[]>([]); 
    
    const[initialPosition, setInitialPosition] = useState<[number, number]>([0,0]);

    const[inputData, setInputData] = useState({
        name: '',
        email: '',
        whatsapp: '',
    })

    const[selectedUf, setSelectedUf] = useState<string>('0');  
    const[selectedCity, setSelectedCity] = useState<string>('0');
    const[selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0]);
    const[selectedItems, setSelectedItems] = useState<number[]>([]);
    const[selectedFile, setSelectedFile] = useState<File>();

    const history = useHistory();

    useEffect(()=> {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            setInitialPosition([latitude, longitude]);
        })
    }, []);

    useEffect(()=> {
        api.get('items').then(({data}) => {
            setItems(data);
        });
    }, []);

    useEffect(()=> {
        axios.get<[{ sigla: string }]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
        .then(({data}) => {
            const ufInitials = data?.map((uf) => uf.sigla);
            setUfs(ufInitials);
        });
    }, []);

    useEffect(()=> {
        if(selectedUf === '0'){
            return;
        }

        axios.get<[{ nome: string }]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
        .then(({data}) => {
            const cityNames = data?.map((city) => city.nome);
            setCities(cityNames);
        });

    }, [selectedUf]);

    useEffect(()=>{

        axios.get(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${selectedPosition[0]}&longitude=${selectedPosition[1]}`)
        .then(({data}) => {
            console.log(data);
            setUfs([data.principalSubdivisionCode.substr(-2)]);
            setSelectedUf(data.principalSubdivisionCode.substr(-2));
            setCities([data.city]);
            setSelectedCity(data.city);
        });
           
    },[selectedPosition]);

    const handleSelectedUf = (event: ChangeEvent<HTMLSelectElement>) => {
        setSelectedUf(event.target.value);
    };

    const handleSelectedCity = (event: ChangeEvent<HTMLSelectElement>) => {
        setSelectedCity(event.target.value);
    };

    const handleMapClick = (event: LeafletMouseEvent) => {
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng
        ]);
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setInputData({ ...inputData, [name]: value });
    };

    const handleSelectItem = (id: number) => {
        if(selectedItems.includes(id)){
            const filtered = selectedItems.filter(item => item !== id);
            setSelectedItems(filtered);
        } else {
            setSelectedItems([ ...selectedItems, id ]);
        }       
    };

    const handleSubmit = async(event: FormEvent) => {
        event.preventDefault();

        const { name, email, whatsapp } = inputData;
        const uf = selectedUf;
        const city = selectedCity;
        const[latitude, longitude] = selectedPosition;
        const items = selectedItems;

        const data = new FormData();

        data.append('name', name);
        data.append('email', email);
        data.append('whatsapp', whatsapp);
        data.append('uf', uf);
        data.append('city', city);
        data.append('latitude', String(latitude));
        data.append('longitude', String(longitude));
        data.append('items', items.join(','));
        selectedFile && data.append('image', selectedFile);
        

        await api.post('points', data);
    
        alert('Ponto de coleta criado');

        history.push('/');

    };

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>
                <Link to="/">
                    <FiArrowLeft />
                    Home
                </Link>
            </header>
            <form onSubmit={handleSubmit}>
                <h1>Recycling Centre <br /> registration</h1>

                <Dropzone onFileUploaded={setSelectedFile} />

                <fieldset>
                    <legend>
                        <h2>Info</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name">Institution name</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="field-group">
                    <div className="field">
                        <label htmlFor="email">E-mail</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="whatsapp">Whatsapp</label>
                        <input
                            type="text"
                            name="whatsapp"
                            id="whatsapp"
                            onChange={handleInputChange}
                        />
                    </div>

                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Address</h2>
                        <span>Click to mark the address in the map below:</span>
                    </legend>

                    <Map center={initialPosition} zoom={15} onclick={handleMapClick} >
                        <TileLayer
                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={selectedPosition}  />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Province</label>
                            <select name="" id="" value={selectedUf} onChange={handleSelectedUf}>
                                <option value="0">Province</option>
                                {ufs?.map((uf) => (<option key={uf} value={uf}>{uf}</option>))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">City</label>
                            <select name="" id="" value={selectedCity} onChange={handleSelectedCity}>
                                <option value="0">City</option>
                                    {cities?.map(city => (<option key={city} value={city}>{city}</option>))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Accepted items</h2>
                        <span>Select one or more items below</span>
                    </legend>
                    <ul className="items-grid">
                        {items?.map((item) => (
                            <li key={item.id} 
                            onClick={() => handleSelectItem(item.id)}
                            className={selectedItems.includes(item.id) ? 'selected' : ''}
                            >
                                <img src={item.image_url} alt=""/>
                                <span>{item.title}</span>
                            </li>
                        ))}
                        
                    </ul>
                </fieldset> 

                <button type="submit">
                    Save
                </button>
            </form>
        </div>
    );

};

export default CreatePoint;