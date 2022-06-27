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
  searchField?: string
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
  @Input() extraDisplay?; // value before option text ex: [id-description]
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
  @Input() ElementWidth;

  @Output() selectionChange: EventEmitter<any> = new EventEmitter();
  @Output() onSearch: EventEmitter<any> = new EventEmitter();

  @ViewChild('selectElem', { static: false }) selectElem;
  @ViewChild('searchInput', { static: false }) searchInput;

  options: Array<any> = [];
  selectedOps: Array<any> = [];
  originOptions: Array<any> = [];


  //to be reconsidered
  filteredOptions: Array<any> = [];
  selectedValue: Array<any> = [];
  displayOptions: Array<string> = [];
  allSelectedValues = [];
  selectAllChecked = false;
  displayString = '';
  ctrlClicked = false;
  searchBy = 'initial';
  selectedVal;
  search = false;

  constructor() { }

  ngOnInit(): void {
    this.onSearch.emit('');
    this.options$.subscribe(res => {
      const copyArray = [...res];
      copyArray.sort(this.sortOptions());
      this.originOptions = this.filteredOptions = copyArray;
      if (this.search) {
        let notSelectedOptions = [];
        this.originOptions.forEach(option => {
          if (!this.selectedValue.includes(option[this.value])) {
            notSelectedOptions.push(option);
          }
        });
        this.options = notSelectedOptions;
      }
      if (!this.searchBy) { this.reArrangeOptions(); }
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
      this.allSelectedValues = this.selectedOptions;
      if (this.selectedVal) {
        this.options = this.options?.filter((obj) => {
          if (obj.id === this.selectedVal.toString()) {
            this.selectedOps.push(obj);
          }
          return obj.id !== this.selectedVal.toString();
        })
      }
      this.selectedOps.sort(this.sortOptions());
      this.displayOptions.sort(this.sortOptions());
      this.preserveSelectedOptions();
      this.onDisplayString();

    } else if (this.fieldFormControl.value) {
      this.selectedValue = this.fieldFormControl.value;
      this.allSelectedValues = this.selectedOptions;
      this.onDisplayString();
    }
    this.selectedVal = null;
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


  //not used
  toggleDropdown(): void {
    this.selectElem.toggle();
  }

  toggleSelectAll(val): void {
    if (val.checked) {
      this.filteredOptions.forEach(option => {
        if (!this.selectedValue.includes(option[this.value])) {
          this.selectedValue = this.selectedValue.concat([option[this.value]]);
          this.allSelectedValues = this.selectedValue;
          if(this.search) {
            this.selectedOps = [...new Set([...this.selectedOps, ...this.originOptions])];
          }
          else {
            this.selectedOps = this.originOptions;
          }
          this.options = [];
        }
      });
    } else {
      const filteredValues = this.getFilteredOptionsValues();
      this.selectedValue = this.selectedValue.filter(item => !filteredValues.includes(item));
      this.allSelectedValues = this.selectedValue;
      this.options = this.originOptions;
      this.selectedOps = [];
      this.selectedVal = null;
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
        if (this.selectedOps.length) {
          for (const option of this.selectedOps) {
            if (option && option[this.display]) {
              this.displayString += option[this.display] + ', ';
            }
          }
          this.displayString = this.displayString.slice(0, -2);
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
        this.searchInput.displayOption = this.originOptions.filter(
          option => option[this.value] == this.selectedValue
        );
        if (this.displayOptions.length) {
          this.displayString = this.displayOptions[0][this.display];
        }
      }
    }
    return this.displayString;
  }

  optionClicked(v): void {
    this.selectedVal = v.source.value;
    if (!v.source.selected && v.isUserInput) {
      const index = this.allSelectedValues.indexOf(v.source.value);
      this.allSelectedValues.splice(index, 1);
      this.selectedOps =  this.selectedOps.filter(option => {
        return option.id !== v.source.value;
      })
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
    this.reArrangeOptions();
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
    if (ev.keyCode == 13) {
      if (this.selectElem.options.first.selected) {
        ev.cancelBubble = true;
        ev.preventDefault();
        ev.stopImmediatePropagation();
      }
      else {
        this.selectElem.options.first.select();
      }
    }
  }

  clearSelection(): void {
    this.options = this.originOptions;
    this.selectAllChecked = false;
    this.selectedValue = [];
    this.allSelectedValues = [];
    this.selectedOps = [];
    this.selectedVal = null;
    this.selectionChange.emit(this.selectedValue);
  }

  reArrangeOptions(): void {
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
      if (!this.displayOptions.find(opt => opt[this.value] == option)) {
        this.displayOptions.push(this.originOptions.find(opt => opt[this.value] == option));
      }
    });
  }
}


