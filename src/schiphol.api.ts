const request = require('request');

interface httpResponse {
    headers: {
        link: string;
    };
    body: any;
}

export default class SchipholApi {
    private _applicationId: string;
    private _applicationKey: string;
    private _limitAmountOfRequestEachMinute: number;
    private _userAgent: string;
    private _endpoint: string = 'https://api.schiphol.nl';

    constructor(
        applicationId: string,
        applicationKey: string,
        limitAmountOfRequestEachMinute: number,
        userAgent: string = 'IVAO_RFE',
    ) {
        this._applicationId = applicationId;
        this._applicationKey = applicationKey;
        this._limitAmountOfRequestEachMinute = limitAmountOfRequestEachMinute;
        this._userAgent = userAgent;
    }

    /**
     * Retrieving all flights for a specific date with the Schiphol API
     * @param date Retrieve all flights for this date
     * @param scheme The scheme (object) that will be returned for each flight
     */
    public retrieveFlightsForDate(date: string, scheme: {}): Promise<any> {
        const endpoint = `/public-flights/flights?scheduleDate=${date}&includedelays=false`;
        return new Promise((resolve, reject) => {
            try {
                this._getAllDataFromPaginatedSource(endpoint, (data: [{}]) => {
                    return resolve(
                        data.map(flight =>
                            this._mapFlightToScheme(flight, scheme),
                        ),
                    );
                });
            } catch (e) {
                return reject(e);
            }
        });
    }

    /**
     * Maps the flight to a specific scheme
     * @param flight Returned object of a flight from the Schiphol API
     * @param scheme Scheme to map the returned object to
     */
    private _mapFlightToScheme(flight: any, scheme: any): {} {
        const result: any = {};
        Object.keys(scheme).forEach((key: any) => {
            result[key] = flight[scheme[key]];
        });
        return result;
    }

    /**
     * Recursivly calls all endpoints that are available for the data endpoint
     * It looks if the header 'link' has the keyword next in them if so it keeps calling the next url
     * If not it calls the callback with the data array
     * @param url Url to retrieve the data
     * @param callback Callback which fires when the data is fully complete
     * @param data Data array
     * @param page Current page number
     */
    private async _getAllDataFromPaginatedSource(
        url: string,
        callback: (data: any) => void,
        data: any = [],
        page = 0,
    ): Promise<void> {
        const response = await this._generateRequest(`${url}&page=${page}`);
        if (response.headers.link.includes('next') === false) {
            return callback(data);
        }
        this._getAllDataFromPaginatedSource(
            url,
            callback,
            [...data, ...response.body[Object.keys(response.body)[0]]], // First propery of object
            page + 1,
        );
    }
    /**
     * Generates a HTTP request with the correct credentials in the header
     * @param url Source url to retrieve the data
     */
    private _generateRequest(url: string): Promise<httpResponse> {
        // The API has a throttle on the amount of requests in each minute
        const msDelay = (60 / this._limitAmountOfRequestEachMinute) * 1000;
        return new Promise((resolve, reject) => {
            request(
                {
                    url: `${this._endpoint}${url}`,
                    headers: {
                        'User-Agent': this._userAgent,
                        Accept: 'application/json',
                        app_id: this._applicationId,
                        app_key: this._applicationKey,
                        ResourceVersion: 'v4',
                    },
                },
                (e: any, response: any, body: string) => {
                    if (e || response.statusCode !== 200) return reject(e);
                    return setTimeout(
                        () =>
                            resolve({
                                headers: response.headers,
                                body: JSON.parse(body),
                            }),
                        msDelay,
                    );
                },
            );
        });
    }
}
