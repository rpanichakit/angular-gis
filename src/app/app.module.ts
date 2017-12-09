import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { EsriLoaderModule } from 'angular-esri-loader';

import { TilesService } from './tiles.service';
import { MapComponent } from './map/map.component';
import { SelectControlComponent } from './select-control/select-control.component';
import { AppComponent } from './app.component';


@NgModule({
  declarations: [
    MapComponent,
    SelectControlComponent,
    AppComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    EsriLoaderModule
  ],
  providers: [TilesService],
  bootstrap: [AppComponent]
})
export class AppModule { }
