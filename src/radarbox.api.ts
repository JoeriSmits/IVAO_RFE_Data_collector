const request = require('request');

export default class RadarboxApi {
    private _endpoint: string = 'https://www.radarbox24.com/data/flights/';

    /**
     * Access radarbox24 to retrieve all fightdata from the flightnumber
     * @param flightNumber Flight number of the flight we retrieve the data
     */
    public async retrieveFlightData(flightNumber: string): Promise<{} | null> {
        const body = await this._generateRequest(this._endpoint + flightNumber);
        const flights = this._pickFlightsArrayFromBody(body);
        if (!flights) return null;
        return this._mapFlightsArrayToFlightObject(flights);
    }

    /**
     * Maps the flights array to a more readable format
     * If data is missing we return an empty object
     * @param flights Array of flights
     */
    private _mapFlightsArrayToFlightObject(flights: [{}]) {
        try {
            const flight: any = {};
            Object.keys(flights[0]).forEach((key: any) => {
                const flightsWithValueForKey: any = flights.filter(
                    (flight: any) => flight[key],
                );
                if (flightsWithValueForKey.length === 0)
                    return (flight[key] = null);
                return (flight[key] = flightsWithValueForKey[0][key]);
            });

            const {
                acr,
                act,
                acd,
                th1,
                cs,
                aporgic,
                aporgna,
                apdstic,
                apdstna,
                mrgdeps,
                mrgarrs,
                depgate,
                arrgate,
            }: any = flight;

            return {
                callsign: cs,
                aircraft: {
                    registration: acr,
                    type: act,
                    description: acd,
                    image: th1
                        ? `https://cdn.radarbox24.com/photo/${th1}`
                        : null,
                },
                departure: {
                    identifier: aporgic,
                    name: aporgna,
                    gate: depgate,
                    scheduledTime: mrgdeps,
                },
                arrival: {
                    identifier: apdstic,
                    name: apdstna,
                    gate: arrgate,
                    scheduledTime: mrgarrs,
                },
            };
        } catch (e) {
            return {};
        }
    }

    /**
     * Looks for the list: array in the HTML document and parse this to an array
     * @param body HTML body
     */
    private _pickFlightsArrayFromBody(body: string): [{}] | null {
        const match = new RegExp(/list:(.*?)}\)/gs).exec(body);
        if (!match) return null;
        return JSON.parse(match[1]);
    }

    /**
     * Generate a request
     * @param url Requested url
     */
    private _generateRequest(url: string): Promise<string> {
        return new Promise((resolve, reject) => {
            request(url, (e: any, response: any, body: string) => {
                if (e || response.statusCode !== 200) return reject(e);
                return resolve(body);
            });
        });
    }
}
