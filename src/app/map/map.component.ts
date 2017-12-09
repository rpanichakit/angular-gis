import {
    Component,
    OnInit,
    AfterContentInit,
    Input,
    ElementRef,
    Output,
    EventEmitter,
    ContentChildren,
    QueryList
} from '@angular/core';

import { EsriLoaderService } from 'angular-esri-loader';

@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss']
})

export class MapComponent implements OnInit, AfterContentInit {
    @Input() basemap;
    @Input() layers;
    @Input() hasSearch: boolean;
    @Input() hasLocate: boolean;
    @Input() hasLayerList: boolean;
    @Input() hasLineDistance: boolean;
    @Input() baseMapToggle: string;
    @Input() locateOnClick: boolean;

    @Output() viewLoaded = new EventEmitter();
    @Output() lineUpdated = new EventEmitter();

    TileLayer;
    Legend;
    SearchWidget;
    Polyline;
    Graphic;

    geometryEngine;
    map;
    view;
    legendWidget;
    locatorTask;
    draw;
    lineDistanceMiles;
    drawingLine = false;

    constructor(
        private esriLoader: EsriLoaderService,
        private el: ElementRef
    ) {

    }

    ngOnInit() {
        this.loadModules();
    }

    ngAfterContentInit() {
        // if (this.layers) {
        //     this.layers.changes.subscribe(() => {
        //         this.addLayer(this.layers.last.layer);
        //     });
        // }
    }

    loadModules() {
        this.esriLoader.loadModules(
            [
                'esri/Map',
                'esri/views/SceneView',
                'esri/views/MapView',
                'esri/layers/TileLayer',
                'esri/widgets/Legend',
                'esri/widgets/Locate',
                'esri/widgets/Search',
                'esri/widgets/LayerList',
                'esri/widgets/BasemapToggle',
                'esri/views/2d/draw/Draw',
                'esri/Graphic',
                'esri/geometry/Polyline',
                'esri/tasks/Locator',
                'esri/geometry/geometryEngine'
            ])
            .then(([
                Map,
                SceneView,
                MapView,
                TileLayer,
                Legend,
                Locate,
                Search,
                LayerList,
                BasemapToggle,
                Draw,
                Graphic,
                Polyline,
                Locator,
                geometryEngine
            ]) => {
                this.TileLayer = TileLayer;
                this.Legend = Legend;
                this.SearchWidget = Search;
                this.Polyline = Polyline;
                this.Graphic = Graphic;
                this.geometryEngine = geometryEngine;

                this.map = new Map({
                    basemap: this.basemap
                });

                this.view = new SceneView({
                    container: this.el.nativeElement,
                    map: this.map
                });

                this.locatorTask = new Locator({
                    url: 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer'
                });

                if (this.locateOnClick) {
                    this.bindViewClick();
                }

                this.view.then(() => {
                    if (this.hasLineDistance) {
                        this.draw = new Draw({
                            view: this.view
                        });

                        this.view.ui.add('line-button', 'top-left');
                    }

                    if (this.layers) {
                        this.layers.forEach(l => {
                            const viewLayer = new TileLayer(l);
                            this.map.layers.add(viewLayer);
                        });
                    }

                    if (this.hasSearch) {
                        this.view.ui.add(new Search({ view: this.view }), 'top-left');
                    }

                    if (this.hasLocate) {
                        this.view.ui.add(new Locate({ view: this.view }), 'top-left');
                    }

                    if (this.hasLayerList) {
                        this.view.ui.add(new LayerList({ view: this.view }), 'bottom-left');
                    }

                    if (this.baseMapToggle) {
                        this.view.ui.add(new BasemapToggle({
                            view: this.view,
                            nextBasemap: this.baseMapToggle
                        }), 'bottom-left');
                    }

                    this.viewLoaded.emit();
                });
            });
    }

    bindViewClick() {
        this.view.on('click', (event) => {
            event.stopPropagation();
            if (!this.drawingLine) {
                const lat = this.roundLatLng(event.mapPoint.latitude);
                const lng = this.roundLatLng(event.mapPoint.longitude);
                this.view.popup.open({
                    title: `Reverse geocode: [${lng}, ${lat}]`,
                    location: event.mapPoint
                });

                this.locatorTask.locationToAddress(event.mapPoint)
                    .then(response => {
                        this.view.popup.content = response.address;
                    })
                    .otherwise(error => {
                        this.view.popup.content = 'No address was found for this location';
                    });
            }
        });
    }

    roundLatLng(value) {
        return Math.round(value * 1000) / 1000;
    }

    getLayer(layerId) {
        return this.map.findLayerById(layerId);
    }

    addLayer(config) {
        const layer = new this.TileLayer(config);
        this.map.layers.add(layer);
        return layer;
    }

    removeLayer(layerId) {
        const layer = this.map.findLayerById(layerId);
        if (layer) {
            this.map.remove(layer);
        }
    }

    setLayerVisibility(layerId, visible) {
        const layer = this.map.findLayerById(layerId);
        if (layer) {
            layer.visible = visible;
        }
    }

    goToLayerExtent(layerId) {
        const layer = this.map.findLayerById(layerId);
        this.goTo(layer.fullExtent);
    }

    goTo(destination) {
        this.view.goTo(destination);
    }

    addLegend(layerInfos) {
        if (this.Legend) {
            this.legendWidget = new this.Legend({
                view: this.view,
                layerInfos
            });
            this.view.ui.add(this.legendWidget, 'bottom-right');
        }
    }

    removeLegend() {
        if (this.legendWidget) {
            this.view.ui.remove(this.legendWidget);
        }
    }

    startDrawing() {
        this.lineDistanceMiles = 0;
        this.view.graphics.removeAll();
        const action = this.draw.create('polyline');
        this.view.focus();
        this.drawingLine = true;
        action.on('vertex-add', this.createGraphic.bind(this));
        action.on('cursor-update', this.createGraphic.bind(this));
        action.on('draw-complete', this.drawComplete.bind(this));
    }

    drawComplete(evt) {
        this.drawingLine = false;
        return this.createGraphic(evt);
    }

    createGraphic(evt) {
        const vertices = evt.vertices;
        this.view.graphics.removeAll();
        const geometry = new this.Polyline({
            paths: evt.vertices,
            spatialReference: this.view.spatialReference
        });
        const graphic = new this.Graphic({
            geometry,
            symbol: {
                type: 'simple-line',
                color: [4, 90, 141],
                width: 4,
                cap: 'round',
                join: 'round'
            }
        });

        this.lineDistanceMiles = this.geometryEngine.geodesicLength(geometry, 'miles').toFixed(2);

        this.view.graphics.add(graphic);
        this.lineUpdated.emit(this.lineDistanceMiles);

        return {
            graphic
        };
    }
}
