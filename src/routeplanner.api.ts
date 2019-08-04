const request = require('request');

export default class RoutePlannerApi {
    private _endpoint: string = 'http://rfinder.asalink.net/free/autoroute_rtx.php';

    private _departure: string = '';
    private _arrival: string = '';

    private _generalOptions: {} = {
        minalt: 'FL330',
        maxalt: 'FL330',
        lvl: 'B',
        dbid: '1908',
        usesid: 'Y',
        usestar: 'Y',
        easet: 'Y',
        rnav: 'Y',
        nats: 'R',
    }

    /**
     * Retrieves a flightplan route using rfinder
     * If no route can be found it returns null
     * @param departure ICAO Code of departure airport
     * @param arrival ICAO Code of arrival airport
     */
    public async getRoute(departure: string, arrival: string): Promise<string | null> {
        this._departure = departure;
        this._arrival = arrival;

        const response = await this._generateRequest().catch(() => 'rejected');
        return this.parseRoute(response);
    }

    private parseRoute(htmlBody: string) {
        const match = new RegExp(/<tt><b>(.*)<\/b><\/tt>/gs).exec(htmlBody);
        if(!match) return null;
        const route = match[1];
        return route
               .replace(/<b>/g, '')
               .replace(/<\/b>/g, '')
               .replace('SID', '')
               .replace('STAR', '')
               .replace(this._departure, '')
               .replace(this._arrival, '')
               .trim();
    }

    private _generateRequest(): Promise<string> {
        return new Promise((resolve, reject) => {
            const formData = {
                id1: this._departure,
                id2: this._arrival,
            }
            request.post({
                url: this._endpoint, 
                formData: {...this._generalOptions, ...formData}}, (e: any, response: any, body: string) => {
                if(e || response.statusCode !== 200) return reject(e);
                return resolve(body);
            });
        });
    }
}