import FlightStats from "./schiphol.api";
import RadarboxApi from './radarbox.api';

const flightStats = new FlightStats(
    '20e7ff57',
    'b3b5c6e8ef99b76a55775763794eb950',
    200,
);

const execute = async () => {
    // let flights = await flightStats.retrieveFlightsForDate('2019-07-20', {
    //         flightName: 'flightName',
    //         direction: 'flightDirection',
    //         pier: 'pier',
    //         gate: 'gate',
    //     }
    // );
    // // Remove codeshare flights
    // flights = flights.filter((flight: any) => flight.flightName !== flight.mainFlight);
    // // Change gate for cargo flights
    // flights = flights.map((flight: any) => {
    //     if(flight.serviceType === 'F') flight.gate = 'CARGO';
    //     return flight;
    // });

    const flights = { flightName: 'EJU7991', direction: 'D', pier: null, gate: null };


    const radarbox = new RadarboxApi();
    const data = await radarbox.retrieveFlightData('EJU7991');
    console.log(data);
}

execute();
