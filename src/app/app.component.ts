import {
  Component,
  ViewChild
} from '@angular/core';
import { SelectAutocompleteComponent } from 'select-autocomplete';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild(SelectAutocompleteComponent) multiSelect: SelectAutocompleteComponent;

  options = [
    {
      display: 'One',
      value: '1'
    }, {
      display: 'Two',
      value: '2'
    }, {
      display: 'Three',
      value: '3'
    }, {
      display: 'Four',
      value: '4'
    }, {
      display: 'Five',
      value: '5'
    }, {
      display: 'Six',
      value: '6'
    }
  ];
  selectedOptions = ['1', '2', '3'];
  selected = this.selectedOptions;
  showError = false;
  errorMessage = '';

  constructor() {}

  onToggleDropdown() {
    this.multiSelect.toggleDropdown();
  }

  resetAll() {
    this.selectedOptions = [];
  }

  getSelectedOptions(selected) {
    console.log(selected);
    this.selected = selected;
  }

  onValidate() {
    this.showError = !this.showError;
    this.errorMessage = 'This field is required';
  }
}
