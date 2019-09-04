const flights = require('../flights.json');
const ObjectsToCsv = require('objects-to-csv');

const filteredFlights = flights.filter((flight: any) =>
 flight.route && flight.callsign && flight.aircraft.type);

const transformedFlights = filteredFlights.map((flight: any) => {
    const deptime = new Date(flight.departure.scheduledTime * 1000);
    const arrtime = new Date(flight.arrival.scheduledTime * 1000);

    if (deptime.getDate() !== arrtime.getDate()) {
        arrtime.setDate(30);
    } else {
        arrtime.setDate(29);
    }

    deptime.setMonth(8);
    deptime.setDate(29);
    arrtime.setMonth(8);

    return {
        flightnumber: flight.flightName,
        radiocallsign: flight.callsign,
        origin: flight.departure.identifier,
        destination: flight.arrival.identifier,
        deptime: deptime.toISOString().slice(0, 19).replace('T', ' '),
        arrtime: arrtime.toISOString().slice(0, 19).replace('T', ' '),
        gate: flight.gate,
        aircraft: flight.aircraft.type,
        route: flight.route,
        created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updated_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    };
});

(async () => {
    const csv = new ObjectsToCsv(transformedFlights);
    await csv.toDisk('./flights.csv');
})();
