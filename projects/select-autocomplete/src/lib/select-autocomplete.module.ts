import { NgModule } from '@angular/core';
import { SelectAutocompleteComponent } from './select-autocomplete.component';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule, MatCheckboxModule} from '@angular/material';

@NgModule({
  imports: [BrowserAnimationsModule, MatFormFieldModule, MatSelectModule, FormsModule, ReactiveFormsModule,
    MatIconModule, MatCheckboxModule, MatButtonModule],
  declarations: [SelectAutocompleteComponent],
  exports: [SelectAutocompleteComponent]
})
export class SelectAutocompleteModule { }
