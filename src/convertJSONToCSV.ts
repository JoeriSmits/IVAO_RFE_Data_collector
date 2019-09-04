const flights = require('../flights.json');

const filteredFlights = flights.filter((flight: any) => flight.route !== null);

const transformedFlights = filteredFlights.map((flight: any) => {
    return {
        flightnumber: flight.flightName,
        radiocallsign: flight.callsign,
        origin: flight.departure.identifier,
        destination: flight.arrival.identifier,
        deptime: new Date(flight.departure.scheduledTime * 1000),
        arrtime: new Date(flight.arrival.scheduledTime * 1000),
        gate: flight.gate,
        aircraft: flight.aircraft.type,
        route: flight.route,
        created_at: new Date(),
        updated_at: new Date(),
    };
});

console.log(transformedFlights);