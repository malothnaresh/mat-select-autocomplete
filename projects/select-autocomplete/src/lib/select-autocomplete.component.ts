import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
  OnInit,
  AfterViewInit,
} from '@angular/core';
import { FormControl } from '@angular/forms';

export interface ElementsSelectors {
  inputField: string;
  selectField: string;
  clearFieldIcon: string;
  clearSelection: string;
}
@Component({
  selector: 'mat-select-autocomplete',
  templateUrl: './select-autocomplete.component.html',
  styleUrls: ['./select-autocomplete.component.scss']
})
export class SelectAutocompleteComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() selectPlaceholder = 'search...';
  @Input() placeholder: string;
  @Input() options$;
  @Input() disabled = false;
  @Input() display = 'display';
  @Input() value = 'value';
  @Input() fieldFormControl: FormControl = new FormControl();
  @Input() errorMsg = 'Field is required';
  @Input() showErrorMsg = false;
  @Input() selectedOptions;
  @Input() multiple = true;
  @Input() labelCount = 1;
  @Input() appearance: 'standard' | 'fill' | 'outline' = 'standard';
  @Input() fieldLabel: string;
  @Input() fieldsSelectors: ElementsSelectors;

  @Output() selectionChange: EventEmitter<any> = new EventEmitter();
  @Output() onSearch: EventEmitter<any> = new EventEmitter();

  @ViewChild('selectElem', { static: false }) selectElem;
  @ViewChild('searchInput', { static: false }) searchInput;

  options: Array<any> = [];
  originOptions: Array<any> = [];
  filteredOptions: Array<any> = [];
  selectedValue: Array<any> = [];
  displayOptions: Array<string> = [];
  allSelectedValues = [];
  selectAllChecked = false;
  displayString = '';
  ctrlClicked = false;
  searchBy = 'initial';

  constructor() { }

  ngOnInit(): void {
    this.onSearch.emit('');
    this.options$.subscribe(res => {
      this.originOptions = this.options = this.filteredOptions = res.sort(this.sortOptions());
      if (!this.searchBy) { this.rearrangOptions(); }
      this.checkIfAllSelected();
    });
  }
  ngOnChanges(): void {
    if (this.disabled) {
      this.fieldFormControl.disable();
    } else {
      this.fieldFormControl.enable();
    }
    if (this.selectedOptions) {
      this.selectedValue = this.selectedOptions;
      this.preserveSelectedOptions();
      this.displayOptions.sort(this.sortOptions());
    } else if (this.fieldFormControl.value) {
      this.selectedValue = this.fieldFormControl.value;
    }
  }

  ngAfterViewInit(): void {
    this.searchInput.nativeElement.value = '';
    if (this.selectElem) {
      let click: MouseEvent = null;
      this.selectElem.overlayDir.backdropClick.subscribe((event) => {
        // the backdrop element is still in the DOM, so store the event for using after it has been detached
        click = event;
      });
      const nativeEl = this.selectElem._elementRef.nativeElement;
      nativeEl.addEventListener('focus', () => {
        this.selectElem.open();
      });
      this.selectElem.overlayDir.detach.subscribe((a) => {
        if (click) {
          const el = document.elementFromPoint(click.pageX, click.pageY) as HTMLElement;
          el.click();
        }
      });
    }
  }

  toggleDropdown(): void {
    this.selectElem.toggle();
  }

  toggleSelectAll(val): void {
    if (val.checked) {
      this.filteredOptions.forEach(option => {
        if (!this.selectedValue.includes(option[this.value])) {
          this.selectedValue = this.selectedValue.concat([option[this.value]]);
          this.allSelectedValues = this.selectedValue;
        }
      });
    } else {
      const filteredValues = this.getFilteredOptionsValues();
      this.selectedValue = this.selectedValue.filter(item => !filteredValues.includes(item));
      this.allSelectedValues = this.selectedValue;
    }
    this.selectionChange.emit(this.selectedValue);
  }

  filterItem(value): void {
    this.searchBy = value;
    this.onSearch.emit(this.searchBy);
  }

  hideOption(option): boolean {
    return (this.filteredOptions.indexOf(option) === -1);
  }

  // Returns plain strings array of filtered values
  getFilteredOptionsValues(): any {
    const filteredValues = [];
    this.filteredOptions.forEach(option => {
      filteredValues.push(option[this.value]);
    });
    return filteredValues;
  }

  onDisplayString(): string {
    this.displayString = '';
    if (this.allSelectedValues && this.allSelectedValues.length) {
      if (this.multiple) {
        // Multi select display
        if (this.displayOptions.length) {
          for (const option of this.displayOptions) {
            if (option && option[this.display]) {
              this.displayString += option[this.display] + ', ';
            }
          }
          this.displayString = this.displayString.slice(0, -1);
          if (
            this.selectedValue.length > 1 &&
            this.selectedValue.length > this.labelCount
          ) {
            this.displayString += ` (+${this.selectedValue.length -
              this.labelCount} others)`;
          }
        }
      } else {
        // Single select display
        this.searchInput.displayOption = this.options.filter(
          option => option[this.value] === this.selectedValue
        );
        if (this.displayOptions.length) {
          this.displayString = this.displayOptions[0][this.display];
        }
      }
    }
    return this.displayString;
  }

  optionClicked(v): void {
    if (!v.source.selected && v.isUserInput) {
      const index = this.allSelectedValues.indexOf(v.source.value);
      this.allSelectedValues.splice(index, 1);
      // to be reviewd
      this.searchInput.nativeElement.value = '';
      this.onSearch.emit('');
    }
  }

  onSelectionChange(val): void {
    this.selectedValue = val.value;
    this.allSelectedValues.push(...this.selectedValue);
    this.allSelectedValues = [...new Set([...this.allSelectedValues])];
    this.checkIfAllSelected();
    this.selectionChange.emit(this.allSelectedValues);
  }

  public trackByFn(index, item): any {
    return item.value;
  }

  setFocus(event): void {
    if (event) {
      this.searchInput.nativeElement.focus();
    } else {
      this.searchInput.nativeElement.value = '';
      this.searchBy = undefined;
      this.onSearch.emit('');
    }
    this.rearrangOptions();
  }

  keyUp(ev): void {
    if (ev.keyCode === 17) {
      this.ctrlClicked = false;
    }
  }
  keyDown(ev): void {
    if (ev.keyCode === 17) {
      this.ctrlClicked = true;
    }
    if (ev.keyCode === 65 && this.ctrlClicked) { // to prevent select all behavior on clicking Ctrl+A
      ev.cancelBubble = true;
      ev.preventDefault();
      ev.stopImmediatePropagation();
    }
    if (ev.code === 'Space') {
      ev.stopPropagation();
    }
  }

  chooseFirstOption(): void {
    this.selectElem.options.first.select();
  }

  clearSelection(): void {
    this.selectAllChecked = false;
    this.selectedValue = [];
    this.allSelectedValues = [];
    this.selectionChange.emit(this.selectedValue);
  }

  rearrangOptions(): void {
    const selectedOptions = [];
    const unselectedOptions = [];
    this.originOptions.forEach(option => {
      if (this.selectedValue.includes(option[this.value])) {
        selectedOptions.push(option);
      } else {
        unselectedOptions.push(option);
      }
    });

    this.options = (this.selectedValue.length === 0) ? this.originOptions : [
      ...selectedOptions,
      ...unselectedOptions
    ];
  }

  checkIfAllSelected(): void {
    if (this.multiple && this.filteredOptions.length > 0) {
      this.selectAllChecked = this.filteredOptions.every(item => this.selectedValue.includes(item[this.value]));
    }
  }
  sortOptions() {
    return (a, b) => {
      const nameA = a[this.display].toUpperCase();
      const nameB = b[this.display].toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    };
  }

  preserveSelectedOptions(): void {
    this.displayOptions = this.displayOptions.filter(opt => this.allSelectedValues.includes(opt[this.value]));
    this.allSelectedValues.forEach(option => {
      if (!this.displayOptions.find(opt => opt[this.value] === option)) {
        this.displayOptions.push(this.options.find(opt => opt[this.value] === option));
      }
    });
  }
}


