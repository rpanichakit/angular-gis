import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { EsriLoaderService } from 'angular-esri-loader';

import { TilesService } from './tiles.service';
import { MapComponent } from './map/map.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild(MapComponent) mapComponent: MapComponent;
  demographics;
  housingDensities;
  previousDensity;
  selectedDensity = 'none';
  previousDemographics;
  selectedDemographics = 'none';
  lineDistanceMiles;
  esriLoaded = false;
  viewLoaded = false;

  layers = [
    {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer',
      id: 'streets',
      opacity: 0.7,
      visible: false
    }
  ];

  baseMap = 'topo';
  hasSearch = true;
  hasLayerList = true;
  hasLocate = true;
  baseMapToggle = 'hybrid';
  locateOnClick = true;
  hasLineDistance = true;

  constructor(
    private esriLoader: EsriLoaderService,
    private tilesService: TilesService
  ) {

  }

  ngOnInit() {
    return this.esriLoader.load()
      .then(() => {
        this.esriLoaded = true;
      });
  }

  onViewLoaded() {
    this.viewLoaded = true;
    this.loadDemographics();
    this.loadHousingDensities();
  }

  roundLatLng(value) {
    return Math.round(value * 1000) / 1000;
  }

  loadDemographics() {
    this.tilesService.getDemographics()
      .then(() => {
        this.demographics = this.tilesService.services;
      });
  }

  loadHousingDensities() {
    this.tilesService.getHousingDensities()
      .then(() => {
        this.housingDensities = this.tilesService.housingDensities;
      });
  }

  onDemoGraphicsChanged(selected) {
    if (selected) {
      this.selectedDemographics = selected;
    }

    this.mapComponent.removeLegend();
    let layersInfo;
    if (this.previousDemographics) {
      this.mapComponent.removeLayer(this.previousDemographics);
    }
    if (this.selectedDemographics !== 'none') {
      const layerId = this.selectedDemographics.toLowerCase();
      const layer = {
        url: this.tilesService.getDemographicsUrl(this.selectedDemographics),
        id: layerId,
        visible: true,
        opacity: 1
      };
      this.layers.push(layer);
      this.mapComponent.addLayer(layer).then((viewLayer) => {
        layersInfo = {
          layer: viewLayer,
          title: this.selectedDemographics
        };
        this.mapComponent.addLegend(layersInfo);
        this.mapComponent.goTo(viewLayer.fullExtent);
      });
      this.previousDemographics = layerId;
    } else {
      if (this.selectedDensity && this.selectedDensity !== 'none') {
        const previousLayer = this.mapComponent.getLayer(this.previousDensity);
        this.mapComponent.goTo(previousLayer.fullExtent);
        this.mapComponent.addLegend({
          layer: previousLayer,
          title: this.selectedDensity
        });
      }
    }
  }

  onDensityChanged(selected) {
    this.selectedDensity = selected;

    this.mapComponent.removeLegend();
    if (this.previousDensity) {
      this.mapComponent.removeLayer(this.previousDensity);
    }
    if (this.selectedDensity !== 'none') {
      const layerId = this.selectedDensity.toLowerCase();
      const layer = {
        url: this.tilesService.getDensityUrl(this.selectedDensity),
        id: layerId,
        opacity: 1,
        visible: true
      };
      this.layers.push(layer);
      this.mapComponent.addLayer(layer).then((viewLayer) => {
        this.mapComponent.addLegend({
          layer: viewLayer,
          title: this.selectedDensity
        });
        this.mapComponent.goTo(viewLayer.fullExtent);
      });
      this.previousDensity = layerId;
    } else {
      if (this.selectedDemographics && this.selectedDemographics !== 'none') {
        this.mapComponent.addLegend({
          layer: this.mapComponent.getLayer(this.selectedDemographics.toLowerCase()),
          title: this.selectedDemographics
        });
        this.mapComponent.goToLayerExtent(this.selectedDemographics.toLowerCase());
      }
    }
  }

  onWorldTransportationChange() {
    this.mapComponent.setLayerVisibility(this.layers[0].id, this.layers[0].visible);
  }

  onLineUpdated(distance) {
    this.lineDistanceMiles = distance;
  }
}
