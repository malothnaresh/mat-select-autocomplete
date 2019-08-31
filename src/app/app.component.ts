import { SelectAutocompleteComponent } from "select-autocomplete";
import { Component, ViewChild } from "@angular/core";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  @ViewChild(SelectAutocompleteComponent)
  multiSelect: SelectAutocompleteComponent;

  options = [
    {
      label: "One",
      data: "1"
    },
    {
      label: "Two",
      data: "2"
    },
    {
      label: "Three",
      data: "3"
    },
    {
      label: "Four",
      data: "4"
    },
    {
      label: "Five",
      data: "5"
    },
    {
      label: "Six",
      data: "6"
    }
  ];
  selectedOptions = ["1", "2", "3"];
  selected = this.selectedOptions;
  showError = false;
  errorMessage = "";

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
    this.errorMessage = "This field is required";
  }
}
