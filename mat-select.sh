npm run package
rm -rf ../frontoffice-ui/node_modules/mat-select-autocomplete-angular11/*
cp dist/select-autocomplete/mat-select-autocomplete-angular11-1.4.18.tgz ../frontoffice-ui/node_modules/mat-select-autocomplete-angular11
tar -xf ../frontoffice-ui/node_modules/mat-select-autocomplete-angular11/mat-select-autocomplete-angular11-1.4.18.tgz -C ../frontoffice-ui/node_modules/mat-select-autocomplete-angular11
cp -r ../frontoffice-ui/node_modules/mat-select-autocomplete-angular11/package/* ../frontoffice-ui/node_modules/mat-select-autocomplete-angular11/
rm -rf ../frontoffice-ui/node_modules/mat-select-autocomplete-angular11/package
rm -rf ../frontoffice-ui/node_modules/mat-select-autocomplete-angular11/mat-select-autocomplete-angular11-1.4.18.tgz
