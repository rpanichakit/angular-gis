import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class TilesService {
    services;
    housingDensities;

    constructor(private httpClient: HttpClient) { }

    getHousingDensities() {
        return this.httpClient.get('https://tiles.arcgis.com/tiles/nGt4QxSblgDfeJn9/arcgis/rest/services?f=pjson')
            .toPromise()
            .then((data: any) => {
                this.housingDensities = data.services.filter(d => d.name.indexOf('Housing_Density') !== -1);
            }).catch(error => {
                if (console) {
                    console.log(error);
                }
            });
    }

    getDemographics() {
        return this.httpClient.get('https://server.arcgisonline.com/arcgis/rest/services/Demographics?f=pjson')
            .toPromise()
            .then((data: any) => {
                this.services = data.services;
            }).catch(error => {
                if (console) {
                    console.log(error);
                }
            });
    }

    getDemographicsUrl(demographics) {
        return `https://server.arcgisonline.com/ArcGIS/rest/services/${demographics}/MapServer`;
    }

    getDensityUrl(density) {
        return `https://tiles.arcgis.com/tiles/nGt4QxSblgDfeJn9/arcgis/rest/services/${density}/MapServer`;
    }
}
