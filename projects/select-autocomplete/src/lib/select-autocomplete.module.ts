import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatCheckboxModule } from '@angular/material';
import { SelectAutocompleteComponent } from './select-autocomplete.component';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatFormFieldModule,
    ReactiveFormsModule,
  ],
  declarations: [SelectAutocompleteComponent],
  exports: [SelectAutocompleteComponent]
})
export class SelectAutocompleteModule { }
