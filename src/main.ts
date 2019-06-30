import FlightStats from "./SchipholApi";

const flightStats = new FlightStats(
    '20e7ff57',
    'b3b5c6e8ef99b76a55775763794eb950',
);

const execute = async () => {
    const historicData = await flightStats.retrieveFlightsForDate();
    console.log(historicData);
}

execute();
