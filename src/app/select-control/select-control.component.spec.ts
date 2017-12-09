import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SelectControlComponent } from './select-control.component';

describe('SelectControlComponent', () => {
    const controlName = 'Test Title';
    const testItems = [
        {
            name: 'item1'
        },
        {
            name: 'item2'
        }
    ];

    let fixture: ComponentFixture<SelectControlComponent>,
        selectControl: SelectControlComponent;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                CommonModule,
                FormsModule
            ],
            declarations: [
                SelectControlComponent
            ],
        }).compileComponents();
    }));
    it('should create select control', async(() => {
        fixture = TestBed.createComponent(SelectControlComponent);
        selectControl = fixture.debugElement.componentInstance;
        selectControl.controlName = controlName;
        selectControl.items = testItems;
        fixture.detectChanges();
        expect(selectControl).toBeTruthy();
    }));
    it(`should show control name ${controlName}`, async(() => {
        const nameEl = fixture.debugElement.query(By.css('.control-name'));
        expect(nameEl.nativeElement.textContent).toEqual(controlName);
    }));

    it(`should have the right item count`, async(() => {
        const options = fixture.debugElement.queryAll(By.css('select option'));
        expect(options.length).toEqual(testItems.length + 1);
    }));

    it(`should have the right items`, async(() => {
        const options = fixture.debugElement.queryAll(By.css('select option'));
        options.forEach((o, index) => {
            if (index === 0) {
                expect(o.nativeElement.getAttribute('value')).toEqual('none');
            } else {
                expect(o.nativeElement.getAttribute('value')).toEqual(testItems[index - 1].name);
            }
        });
    }));
});
