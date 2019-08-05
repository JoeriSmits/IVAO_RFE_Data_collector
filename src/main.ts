import SchipholApi from "./schiphol.api";
import RadarboxApi from './radarbox.api';
import RoutePlannerApi from './routeplanner.api';

const _cliProgress = require('cli-progress');
const fs = require('fs');

const progressBar = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);

const schipholApi = new SchipholApi(
    '20e7ff57',
    'b3b5c6e8ef99b76a55775763794eb950',
    200,
);

const execute = async () => {
    console.info('Retrieving flights from the Schiphol API')
    // // Retrieve all the flights for a specific date
    // let flights = await schipholApi.retrieveFlightsForDate('2019-08-04', {
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

    let flights = [{ flightName: 'AF8496', direction: 'A', pier: 'E', gate: 'E18' },
    { flightName: 'MU8271', direction: 'A', pier: 'E', gate: 'E18' },
    { flightName: 'HV1833', direction: 'D', pier: 'D', gate: 'D81' },
    { flightName: 'HV5807', direction: 'D', pier: 'D', gate: 'D61' },
    { flightName: 'KL2563', direction: 'D', pier: 'D', gate: 'D61' },
    { flightName: 'HV6341', direction: 'D', pier: 'D', gate: 'D79' },
    { flightName: 'KL2537', direction: 'D', pier: 'D', gate: 'D79' },
    { flightName: 'HV163', direction: 'D', pier: 'D', gate: 'D23' },
    { flightName: 'HV5471', direction: 'D', pier: 'D', gate: 'D86' },
    { flightName: 'KL0856', direction: 'A', pier: 'E', gate: 'E20' },
    { flightName: 'AF8421', direction: 'A', pier: 'E', gate: 'E20' },
    { flightName: 'KE5925', direction: 'A', pier: 'E', gate: 'E20' },
    { flightName: 'HV1264', direction: 'A', pier: null, gate: null },
    { flightName: 'HV1411', direction: 'D', pier: 'D', gate: 'D82' },
    { flightName: 'CZ455', direction: 'A', pier: null, gate: null },
    { flightName: 'KL4798', direction: 'A', pier: null, gate: null },
    { flightName: 'HV6223', direction: 'D', pier: 'C', gate: 'C15' },
    { flightName: 'KL2653', direction: 'D', pier: 'C', gate: 'C15' },
    { flightName: 'CND711', direction: 'D', pier: 'C', gate: 'C10' },
    { flightName: 'HV5887', direction: 'D', pier: 'D', gate: 'D71' },
    { flightName: 'OR197', direction: 'D', pier: 'D', gate: 'D68' },
    { flightName: 'KL0428', direction: 'A', pier: 'E', gate: 'E3' },
    { flightName: 'AF8422', direction: 'A', pier: 'E', gate: 'E3' },
    { flightName: 'DL9385', direction: 'A', pier: 'E', gate: 'E3' },
    { flightName: 'OR783', direction: 'D', pier: 'D', gate: 'D4' },
    { flightName: 'HV5629', direction: 'D', pier: 'C', gate: 'C16' },
    { flightName: 'KL2673', direction: 'D', pier: 'C', gate: 'C16' },
    { flightName: 'HV5791', direction: 'D', pier: 'D', gate: 'D74' },
    { flightName: 'KL0588', direction: 'A', pier: 'F', gate: 'F6' },
    { flightName: 'DL9477', direction: 'A', pier: 'F', gate: 'F6' },
    { flightName: 'HV156', direction: 'A', pier: 'A', gate: 'A15' }]

    progressBar.start(flights.length);
    populateFlightsWithAdditionalData(flights, (result: any) => {
        fs.writeFile('flights.json', JSON.stringify(result), 'utf8', () => {
            progressBar.stop();
            console.log('File written');
        });
    });
}

/**
 * Recursivly populates every item in the flight array with additional data
 * from radarbox24 and routeplanner
 * @param flights Array with flight objects from the schiphol api
 * @param callback Callback which will be called when array has been populated
 * @param index Simple counter to keep track of the array index
 */
const populateFlightsWithAdditionalData = async (flights: any[], callback: (result: any) => any, index: number = 0) => {
    if(!flights[index]) { return callback(flights); }

    const flight: any = flights[index];
    const radarbox = await retrieveAdditionalDataFromFlightBox24(flight);
    const route = await retrieveFlightplanRouteFromRoutePlanner({...flight, ...radarbox});
    progressBar.increment();

    flights[index] = {...flight, ...radarbox, ...{route: route}};
    populateFlightsWithAdditionalData(flights, callback, index + 1);
}

const retrieveAdditionalDataFromFlightBox24 = (flight: any): Promise<{} | null> => {
    const radarbox = new RadarboxApi();
    return radarbox.retrieveFlightData(flight.flightName);
}

const retrieveFlightplanRouteFromRoutePlanner = async (flight: any): Promise<string | null> => {
    const routeFinder = new RoutePlannerApi();
    let route = null;
    if(flight.departure && flight.arrival) {
        return await routeFinder.getRoute(flight.departure.identifier, flight.arrival.identifier);
    }
    return route;
}

execute();
