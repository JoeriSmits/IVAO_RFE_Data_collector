import FlightStats from "./SchipholApi";

const flightStats = new FlightStats(
    '20e7ff57',
    'b3b5c6e8ef99b76a55775763794eb950',
    200,
);

const execute = async () => {
    let historicData = await flightStats.retrieveFlightsForDate('2019-07-20', {
            flightName: 'flightName',
            direction: 'flightDirection',
            pier: 'pier',
            gate: 'gate',
        }
    );
    // Remove codeshare flights
    historicData = historicData.filter((flight: any) => flight.flightName !== flight.mainFlight);
    // Change gate for cargo flights
    historicData = historicData.map((flight: any) => {
        if(flight.serviceType === 'F') flight.gate = 'CARGO';
        return flight;
    });



    console.log(historicData);
}

execute();
