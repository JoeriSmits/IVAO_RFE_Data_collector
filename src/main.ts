import SchipholApi from './schiphol.api';
import RadarboxApi from './radarbox.api';
import RoutePlannerApi from './routeplanner.api';
const aircraftTypes = require('../assets/aircraftTypes.json');

const _cliProgress = require('cli-progress');
const fs = require('fs');

const progressBar = new _cliProgress.Bar(
    {},
    _cliProgress.Presets.shades_classic,
);

const schipholApi = new SchipholApi(
    '20e7ff57',
    'b3b5c6e8ef99b76a55775763794eb950',
    200,
);

const execute = async () => {
    console.info('Retrieving flights from the Schiphol API');
    // Retrieve all the flights for a specific date
    let flights = await schipholApi.retrieveFlightsForDate('2019-08-11', {
        flightName: 'flightName',
        direction: 'flightDirection',
        pier: 'pier',
        gate: 'gate',
    });
    // Remove codeshare flights
    flights = flights.filter(
        (flight: any) => flight.flightName !== flight.mainFlight,
    );
    // Change gate for cargo flights
    flights = flights.map((flight: any) => {
        if (flight.serviceType === 'F') flight.gate = 'CARGO';
        return flight;
    });

    progressBar.start(flights.length);
    populateFlightsWithAdditionalData(flights, (result: any) => {
        fs.writeFile('flights.json', JSON.stringify(result), 'utf8', () => {
            progressBar.stop();
            console.log('File written');
        });
    });
};

/**
 * Recursivly populates every item in the flight array with additional data
 * from radarbox24 and routeplanner
 * @param flights Array with flight objects from the schiphol api
 * @param callback Callback which will be called when array has been populated
 * @param index Simple counter to keep track of the array index
 */
const populateFlightsWithAdditionalData = async (
    flights: any[],
    callback: (result: any) => any,
    index: number = 0,
) => {
    if (!flights[index]) {
        return callback(flights);
    }

    const flight: any = flights[index];
    const radarbox = await retrieveAdditionalDataFromFlightBox24(flight).catch(
        console.error,
    );
    const route = await retrieveFlightplanRouteFromRoutePlanner({
        ...flight,
        ...radarbox,
    }).catch(console.error);
    const flightWithCorrectAircraftType = convertICAOAircraftToIATA({
        ...flight,
        ...radarbox,
    });

    progressBar.increment();

    flights[index] = {
        ...flightWithCorrectAircraftType,
        ...radarbox,
        ...{ route: route },
    };
    populateFlightsWithAdditionalData(flights, callback, index + 1);
};

/**
 * We need an IATA code for the aircraft type so we look it up in the ICAO/IATA mapping config
 * @param flight Flight object
 */
const convertICAOAircraftToIATA = (flight: any) => {
    const result = { ...flight };
    if (!result.aircraft) return result;

    const [aircraft] = aircraftTypes.filter((type: any) => {
        const aircraftType = result.aircraft.type || '';
        return type.icaoCode === aircraftType || type.iataCode === aircraftType;
    });
    result.aircraft.type = aircraft ? aircraft.iataCode : result.aircraft.type;
    return result;
};

/**
 * Get additional data from radarbox24 to populate the flight object
 * @param flight Flight object
 */
const retrieveAdditionalDataFromFlightBox24 = (
    flight: any,
): Promise<{} | null> => {
    const radarbox = new RadarboxApi();
    return radarbox.retrieveFlightData(flight.flightName);
};

/**
 * We generate a route with routeplanner for the departe and destination retrieved from
 * radarbox24
 * @param flight Flight object + radarbox24 data
 */
const retrieveFlightplanRouteFromRoutePlanner = async (
    flight: any,
): Promise<string | null> => {
    const routeFinder = new RoutePlannerApi();
    let route = null;
    if (flight.departure && flight.arrival) {
        return await routeFinder
            .getRoute(flight.departure.identifier, flight.arrival.identifier)
            .catch(console.error);
    }
    return route;
};

execute();
