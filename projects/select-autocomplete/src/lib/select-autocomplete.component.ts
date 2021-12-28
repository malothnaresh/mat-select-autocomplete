import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
  OnInit,
  AfterViewInit,
} from "@angular/core";
import { FormControl } from "@angular/forms";

export interface ElementsSelectors {
  inputField: string;
  selectField: string;
  clearFieldIcon: string;
  clearSelection: string;
}
@Component({
  selector: 'multiselect',
  templateUrl: './select-autocomplete.component.html',
  styleUrls: ['./select-autocomplete.component.scss']
})
export class MultiselectComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() selectPlaceholder: string = "search...";
  @Input() placeholder: string;
  @Input() options$;
  @Input() disabled = false;
  @Input() display = "display";
  @Input() value = "value";
  @Input() fieldFormControl: FormControl = new FormControl();
  @Input() errorMsg: string = "Field is required";
  @Input() showErrorMsg = false;
  @Input() selectedOptions;
  @Input() multiple = true;
  @Input() labelCount: number = 1;
  @Input() appearance: "standard" | "fill" | "outline" = "standard";
  @Input() fieldLabel: string;
  @Input() fieldsSelectors: ElementsSelectors;

  @Output() selectionChange: EventEmitter<any> = new EventEmitter();
  @Output() onSearch: EventEmitter<any> = new EventEmitter();

  @ViewChild("selectElem", { static: false }) selectElem;
  @ViewChild('searchInput', { static: false }) searchInput;

  options: Array<any> = [];
  originOptions: Array<any> = [];
  filteredOptions: Array<any> = [];
  selectedValue: Array<any> = [];
  displayOptions: Array<string> = [];
  selectAllChecked = false;
  displayString = "";
  ctrlClicked = false;
  searchBy = 'initial';

  constructor() { }

  ngOnInit(): void {
    this.onSearch.emit('');
    this.options$.subscribe(res => {
      this.originOptions = this.options = this.filteredOptions = res.sort(this.sortOptions());
      if (!this.searchBy) this.rearrangOptions();
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

  toggleDropdown() {
    this.selectElem.toggle();
  }

  toggleSelectAll(val) {
    if (val.checked) {
      this.filteredOptions.forEach(option => {
        if (!this.selectedValue.includes(option[this.value])) {
          this.selectedValue = this.selectedValue.concat([option[this.value]]);
        }
      });
    } else {
      const filteredValues = this.getFilteredOptionsValues();
      this.selectedValue = this.selectedValue.filter(item => !filteredValues.includes(item));
    }
    this.selectionChange.emit(this.selectedValue);
  }

  filterItem(value) {
    this.searchBy = value;
    this.onSearch.emit(this.searchBy);
  }

  hideOption(option) {
    return !(this.filteredOptions.indexOf(option) > -1);
  }

  // Returns plain strings array of filtered values
  getFilteredOptionsValues() {
    const filteredValues = [];
    this.filteredOptions.forEach(option => {
      filteredValues.push(option[this.value]);
    });
    return filteredValues;
  }

  onDisplayString() {
    this.displayString = "";
    if (this.selectedValue && this.selectedValue.length) {
      if (this.multiple) {
        // Multi select display
        if (this.displayOptions.length) {
          for (let i = 0; i < this.displayOptions.length; i++) {
            if (this.displayOptions[i] && this.displayOptions[i][this.display]) {
              this.displayString += this.displayOptions[i][this.display] + ",";
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

  onSelectionChange(val) {
    this.selectedValue = val.value;
    this.checkIfAllSelected();
    this.selectionChange.emit(this.selectedValue);
  }

  public trackByFn(index, item) {
    return item.value;
  }

  setFocus(event) {
    this.rearrangOptions();
    if (event) {
      this.searchInput.nativeElement.focus();
    }
  }

  keyUp(ev) {
    if (ev.keyCode === 17) {
      this.ctrlClicked = false;
    }
  }
  keyDown(ev) {
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

  clearSelection() {
    this.selectAllChecked = false;
    this.selectedValue = [];
    this.selectionChange.emit(this.selectedValue);
  }

  rearrangOptions() {
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

  checkIfAllSelected() {
    if (this.multiple && this.filteredOptions.length > 0) {
      this.selectAllChecked = this.filteredOptions.every(item => this.selectedValue.includes(item[this.value]));
    }
  }
  sortOptions() {
    return (a, b) => {
      var nameA = a[this.display].toUpperCase();
      var nameB = b[this.display].toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    }
  }

  preserveSelectedOptions() {
    this.displayOptions = this.displayOptions.filter(opt => this.selectedValue.includes(opt[this.value]));
    this.selectedValue.forEach(option => {
      if (!this.displayOptions.find(opt => opt[this.value] === option)) {
        this.displayOptions.push(this.options.find(opt => opt[this.value] === option));
      }
    });


  }
}


