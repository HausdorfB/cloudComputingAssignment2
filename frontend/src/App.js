import React, { useState, Component } from "react";
/*global google*/
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

import { formatRelative } from "date-fns";

import usePlacesAutocomplete, {
getGeocode,
getLatLng,  
} from "use-places-autocomplete";

import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
  ComboboxPopover,
} from "@reach/combobox";
import "@reach/combobox/styles.css";
import mapStyles from "./mapStyles";
import "./styles.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Form, Button, FormGroup, FormControl, ControlLabel, Jumbotron } from "react-bootstrap";
import "./App.css";
import CreateTodo from "./components/create-list.component";
import EditTodo from "./components/edit-list.component";
import TodosList from "./components/list-list.component";


const libraries = ["places"];
const mapContainerStyle= {
  width: '99vw',
  height: '80vh',
};
const center = {
  lat: 43.653225,
  lng: -79.383186,
};
const options ={
  styles: mapStyles,
  disableDefaultUI: true,
  zoomControl: true,
};


export default function App() {
  const {isLoaded, loadError} = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });
  const [markers, setMarkers] = React.useState([]);
  const [selected, setSelected] = React.useState(null);
  


  //function initiated on click event
  const onMapClick = React.useCallback((event) => {
    setMarkers((current) => [
      ...current, 
    {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
      time: new Date(),
   },
  ]);
}, []);

  //map element will not expire during pages lifetime
  const mapRef = React.useRef();
  const onMapLoad = React.useCallback((map) => {
    mapRef.current = map;
  }, []);

  //pan to searched location
  const panTo = React.useCallback(({ lat, lng }) => {
    mapRef.current.panTo({lat,lng});
    mapRef.current.setZoom(14);
  }, []);

  
  //error messages if map is not loaded
  if(!isLoaded) return "Working...";
  if(loadError) return "Not Working";


  //PAGE LOADING-------------------------------------------------------------------------------------------------------------
  return (
  <div  className="app">
    <script src="www.gstatic.com/firebasejs/5.3.0/firebase.js"></script>
    {/* //initialize google map with style format. 
    //initialize functionality  */}

    <Search panTo={panTo} />


    <GoogleMap 
      //Setup options for the google map. Functions created above.
      mapContainerStyle={mapContainerStyle} 
      zoom={8}
      center={center}
      options={options}
      onClick={onMapClick}
      onLoad={onMapLoad}
  >

  {markers.map((marker) => 
    <Marker 
    key={marker.time.toISOString()} 
    position={{ lat: marker.lat, lng: marker.lng }} 
    onClick={() => {
      setSelected(marker);
    }} 
  />
)}

//window created when selecting a marker
{selected ? (<InfoWindow position={{lat: selected.lat, lng: selected.lng }} 
//function - reset infoWindow to null after unselecting
onCloseClick={() => {
  setSelected(null);
}}>
  <div>
    <h2>Location Selected</h2>
    <p>Selected today at {formatRelative(selected.time, new Date())}</p>
  </div>
</InfoWindow>) : null}

  </GoogleMap>
  <Jumbotron><h1>Save Location to Database</h1></Jumbotron>
      <Router>
        <div className="container">
          <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <Link to="/" className="navbar-brand"></Link>
            <div className="collpase navbar-collapse">
              <ul className="navbar-nav mr-auto">
                <li className="navbar-item">
                  <Link to="/" className="nav-link">Saved</Link>
                </li>
                <li className="navbar-item">
                  <Link to="/create" className="nav-link">Add Location</Link>
                </li>
              </ul>
            </div>
          </nav>
          <br/>
          <Route path="/" exact component={TodosList} />
          <Route path="/edit/:id" component={EditTodo} />
          <Route path="/create" component={CreateTodo} />
        </div>
      </Router>
  </div>
  
  
  );
}


function Search({panTo}) {
  const {ready, 
    value, 
    suggestions: {status, data}, 
    setValue, 
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      location: {lat: () => 43.653225, lng: () => -79.383186},
      radius: 200 * 1000,
    },
  });

  return ( 
    <div className="search">
  <Combobox onSelect={async (address) => {
    setValue(address, false);
    clearSuggestions();


    try {
      const results = await getGeocode({address});
      const {lat, lng } = await getLatLng(results[0]);
      //move to location retrieved from address
      panTo({ lat, lng });
    } catch (error) {
      console.log("error!")
    }
  }}
  >
    <ComboboxInput value={value} 
    onChange={(e) => {
      setValue(e.target.value);
    }}
    disabled={!ready}
    placeholder="Enter an Address"
      />
      <ComboboxPopover>
        <ComboboxList>
        {status === "OK" && 
        data.map(({id, description}) => (
          <ComboboxOption key={id} value={description} />
        ))}
        </ComboboxList>
      </ComboboxPopover>
    </Combobox>
    </div>
  );
}

