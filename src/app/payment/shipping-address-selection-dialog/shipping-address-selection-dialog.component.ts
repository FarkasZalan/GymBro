import { trigger, transition, style, animate } from "@angular/animations";
import { ChangeDetectorRef, Component, Inject, OnInit } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { NbDialogRef, NbDialogService } from "@nebular/theme";
import { TranslateService } from "@ngx-translate/core";
import { AddressTypeText } from "../../profile/profile-address-type-text";
import { CreateShippingAddressComponent } from "../../profile/profile-shipping-address/create-shipping-address/create-shipping-address.component";
import { EditShippingAddressComponent } from "../../profile/profile-shipping-address/edit-shipping-address/edit-shipping-address.component";
import { ShippingAddress } from "../../profile/profile-shipping-address/shipping-address.model";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { LoadingService } from "../../loading-spinner/loading.service";

@Component({
    selector: 'app-shipping-address-selection-dialog',
    templateUrl: './shipping-address-selection-dialog.component.html',
    styleUrls: ['./shipping-address-selection-dialog.component.scss'],
    animations: [
        trigger('zoomIn', [
            transition(':enter', [
                style({ transform: 'scale(0.95)', opacity: 0 }),
                animate('300ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
            ]),
        ])
    ]
})
export class ShippingAddressSelectionDialogComponent implements OnInit {
    shippingAddresses: ShippingAddress[] = [];
    userId: string;

    constructor(
        private db: AngularFirestore,
        private translate: TranslateService,
        private dialog: MatDialog,
        public dialogRef: MatDialogRef<ShippingAddressSelectionDialogComponent>,
        private dialogService: NbDialogService,
        @Inject(MAT_DIALOG_DATA) public data,
        private changeDetector: ChangeDetectorRef,
        public loadingService: LoadingService
    ) { }

    ngOnInit() {
        this.userId = this.data.userId;
        this.getAllShippingAddress(this.userId);
    }

    async getAllShippingAddress(userId: string) {
        await this.loadingService.withLoading(async () => {
            this.db
                .collection("users")
                .doc(userId)
                .collection("shippingAddresses")
                .valueChanges()
                .subscribe((addresses: ShippingAddress[]) => {
                    this.shippingAddresses = addresses;

                    // Subscribe to language changes and reapply translations
                    this.translate.stream([
                        'profileMenu.shippingAddressForm.home',
                        'profileMenu.shippingAddressForm.work'
                    ]).subscribe(translations => {
                        this.shippingAddresses = this.shippingAddresses.map(address => {
                            if (address.addressType === AddressTypeText.HOME) {
                                address.addressName = translations['profileMenu.shippingAddressForm.home'];
                            }
                            if (address.addressType === AddressTypeText.WORK) {
                                address.addressName = translations['profileMenu.shippingAddressForm.work'];
                            }
                            return address;
                        });

                        this.shippingAddresses = this.sortAddresses(this.shippingAddresses);
                    });
                });
        });
    }

    sortAddresses(addresses: ShippingAddress[]): ShippingAddress[] {
        return addresses.sort((a, b) => {
            if (a.isSetAsDefaultAddress && !b.isSetAsDefaultAddress) return -1;
            if (!a.isSetAsDefaultAddress && b.isSetAsDefaultAddress) return 1;
            return 0;
        });
    }

    selectAddress(address: ShippingAddress) {
        this.dialogRef.close(address);
    }

    editAddress(addressId: string) {
        const dialogRef = this.dialog.open(EditShippingAddressComponent, {
            data: {
                addresId: addressId,
                userId: this.userId
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result?.success && result?.address) {
                this.selectAddress(result.address);
            }
        });
    }

    goToAddNewAddress() {
        const dialogRef = this.dialog.open(CreateShippingAddressComponent, {
            data: {
                userId: this.userId
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result?.success && result?.address) {
                this.selectAddress(result.address);
            }
        });
    }

    close() {
        this.dialogRef.close();
    }
} 