import React from 'react';
import GoogleMapReact from 'google-map-react';
import { Icon, Segment } from 'semantic-ui-react';

const Marker =() => <Icon name="marker" size="huge" color="red" />

const EventDetailedMap =  ({lat, lng}) => {
  const center = [lat, lng];
  const zoom = 15;
  return (
    <Segment attached="bottom" style={{padding: 0}}>
       <div style={{ height: '300px', width: '100%' }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key:'AIzaSyC15Iii6EU4h6WXGO-XLiw_dN3wZXK4E_E' }}
          defaultCenter={center}
          defaultZoom={zoom}
        >
          <Marker
            lat={lat}
            lng={lng}
          />
        </GoogleMapReact>
      </div>
    </Segment>
  )
}

export default EventDetailedMap;
