/*global google*/
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import Script from 'react-load-script';
import moment from 'moment';
import { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import { composeValidators, combineValidators, isRequired, hasLengthGreaterThan } from 'revalidate';
import cuid from 'cuid';
import { Segment, Form, Button, Grid, Header } from 'semantic-ui-react';
import { apiConfig } from '../../../config';
import { createEvent, updateEvent } from '../eventActions';
import TextInput from '../../../app/common/Form/TextInput';
import TextArea from '../../../app/common/Form/TextArea';
import SelectInput from '../../../app/common/Form/SelectInput';
import DateInput from '../../../app/common/Form/DateInput';
import PlaceInput from '../../../app/common/Form/PlaceInput';

const mapState = (state, ownProps) => {
  const eventId = ownProps.match.params.id;

  let event = {};

  if (eventId && state.events.length > 0) {
    event = state.events.filter(event => event.id === eventId)[0];
  }

  return {
    initialValues: event
  };
};

const actions = {
  createEvent,
  updateEvent
};  

const category = [
    {key: 'drinks', text: 'Drinks', value: 'drinks'},
    {key: 'culture', text: 'Culture', value: 'culture'},
    {key: 'film', text: 'Film', value: 'film'},
    {key: 'food', text: 'Food', value: 'food'},
    {key: 'music', text: 'Music', value: 'music'},
    {key: 'travel', text: 'Travel', value: 'travel'},
];

const validate = combineValidators({
  title: isRequired({message: 'The event title is required!'}),
  category: isRequired({message: 'Please provide a category.'}),
  description: composeValidators(
    isRequired({message: 'Please enter a description'}),
    hasLengthGreaterThan(4)({message: 'Description need to be at least 5 characters'})
  )(),
  city: isRequired('city'),
  venue: isRequired('venue'),
  date: isRequired('date')
});

class EventForm extends Component {
  state = {
    cityLatLng : {},
    venueLatLng: {},
    scriptLoaded: false,
  };

  handleCitySelect = (selectedCity) => {
    geocodeByAddress(selectedCity)
      .then(results => getLatLng(results[0]))
      .then(cityLatLng => {
        this.setState({
          cityLatLng,
        })
      })
      .then(() => {
        this.props.change('city', selectedCity) // Handle mouse click on list of options
      })
  }

  handleVenueSelect = (selectedVenue) => {
    geocodeByAddress(selectedVenue)
      .then(results => getLatLng(results[0]))
      .then(venueLatLng => {
        this.setState({
          venueLatLng,
        })
      })
      .then(() => {
        this.props.change('venue', selectedVenue) // Handle mouse click on list of options
      })
  }

  onFormSubmit = values => {
    // Fix Moment issue with React
    values.date = moment(values.date).format();
    
    values.venueLatLng = this.state.venueLatLng;

    if (this.props.initialValues.id) {
      this.props.updateEvent(values);
      this.props.history.goBack();
    } else {
      const newEvent = {
        ...values,
        id: cuid(),
        hostPhotoURL: '/assets/user.png',
        hostedBy: 'Bob'
      };
      this.props.createEvent(newEvent);
      this.props.history.push('/events');
    }
  };

  handleScriptLoaded = () => {
    this.setState({scriptLoaded: true});
  }

  render() {
    const { invalid, submitting, pristine } = this.props;
    return (
      <Grid>
        <Script
          url={`https://maps.googleapis.com/maps/api/js?key=${apiConfig.GOOGLE_API_KEY}&libraries=places`}
          onLoad={this.handleScriptLoaded}
        />
        <Grid.Column width="10">
          <Segment>
            <Form onSubmit={this.props.handleSubmit(this.onFormSubmit)} autoComplete="off">
              <Header sub color="teal" content="Event Details" />
              <Field
                name="title"
                type="text"
                component={TextInput}
                placeholder="Give your event a name"
              />
              <Field
                name="category"
                type="text"
                component={SelectInput}
                options={category}
                placeholder="What is your event about?"
              />
              <Field
                name="description"
                type="text"
                rows="3"
                component={TextArea}
                placeholder="Tell us about your event"
              />
              <Header sub color="teal" content="Event Location Details" />
              <Field
                name="city"
                type="text"
                component={PlaceInput}
                options={{types: ['(cities)']}}
                placeholder="Event city"
                onSelect={this.handleCitySelect}
              />
              {this.state.scriptLoaded && 
                <Field
                  name="venue"
                  type="text"
                  component={PlaceInput}
                  options={{
                    location: new google.maps.LatLng(this.state.cityLatLng),
                    radius: 1000,
                    types: ['establishment']
                  }}
                  placeholder="Event venue"
                  onSelect={this.handleVenueSelect}
                />
              }
              <Field
                name="date"
                type="text"
                component={DateInput}
                dateFormat='YYYY-MM-DD HH:mm'
                timeFormat='HH:mm'
                showTimeSelect
                placeholder='Date and Time of Event'
              />
              <Button disabled={invalid || submitting || pristine} positive type="submit">
                Submit
              </Button>
              <Button onClick={this.props.history.goBack} type="button">
                Cancel
              </Button>
            </Form>
          </Segment>
        </Grid.Column>
      </Grid>
    );
  }
}

export default connect(
  mapState,
  actions
)(reduxForm({ form: 'eventForm', enableReinitialize: true, validate })(EventForm));
