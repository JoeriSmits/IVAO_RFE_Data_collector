const flights = require('../flights.json');

const filteredFlights = flights.filter((flight: any) => flight.route !== null);

console.log(filteredFlights);