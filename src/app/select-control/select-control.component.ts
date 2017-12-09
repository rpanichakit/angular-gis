import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-select-control',
    templateUrl: 'select-control.component.html'
})

export class SelectControlComponent implements OnInit {
    @Input() controlName;
    @Input() items;

    @Output() selectedChange = new EventEmitter();

    selectedItem = 'none';

    constructor() { }

    ngOnInit() { }

    onChange() {
        this.selectedChange.emit(this.selectedItem);
    }
}
