import { Component, HostListener, Inject, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NgForm } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../auth/auth.service';
import { DeleteConfirmationDialogComponent } from '../../../delete-confirmation-dialog/delete-confirmation-dialog.component';
import { DeleteConfirmationText } from '../../../delete-confirmation-dialog/delete-text';
import { DocumentHandlerService } from '../../../document.handler.service';
import { LoadingService } from '../../../loading-spinner/loading.service';
import { SuccessfullDialogComponent } from '../../../successfull-dialog/successfull-dialog.component';
import { SuccessFullDialogText } from '../../../successfull-dialog/sucessfull-dialog-text';
import { ChangeDefaultAddressConfirmDialogComponent } from '../change-default-address-confirm-dialog/change-default-address-confirm-dialog.component';
import { AddressTypeText } from '../profile-address-type-text';
import { ShippingAddress } from '../shipping-address.model';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-handle-shipping-address',
  templateUrl: './handle-shipping-address.component.html',
  styleUrl: '../../../../styles/basic-form.scss',
  animations: [
    // name of tha animation what can call in html
    trigger('collapseFields', [
      state('void', style({
        height: '0px', // Initially collapsed
        overflow: 'hidden'
      })),
      state('*', style({
        height: '*', // Expands to the full height of the content
        overflow: 'hidden'
      })),
      transition('void => *', [
        animate('250ms ease-out') // Expands smoothly
      ]),
      transition('* => void', [
        animate('250ms ease-in') // Collapses smoothly
      ])
    ])
  ]
})
export class HandleShippingAddressComponent {
  // for UI elements
  @ViewChild('form') shippingAddressForm: NgForm;

  errorMessage = false;
  missingAddressNameError = false;

  isCompanyAddressChecked: boolean = false;
  isSetAsDefaultAddress: boolean = false;

  userId: string;
  shippingAddress: ShippingAddress;
  shippingAddressId: string;
  isEditing: boolean = false;

  // Check if these field are undefinied
  companyName: string = "";
  taxNumber: string = "";
  selectedAddressType: string; // Default selected address type

  // the tag, name for the address type
  addressTypeTexts = AddressTypeText;

  // responsibility
  isLargeScreen: boolean = false;

  constructor(
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<HandleShippingAddressComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private documentumHandler: DocumentHandlerService,
    private db: AngularFirestore,
    private auth: AngularFireAuth,
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService,
    public loadingService: LoadingService
  ) {
    this.initializeComponent();
  }

  ngOnInit(): void {
    this.checkScreenSize();
  }

  // display in 1 column the form fields on smaller screens and 2 columns on larger screens
  @HostListener('window:resize', [])
  onResize(): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    this.isLargeScreen = window.innerWidth > 900;
  }

  private async initializeComponent() {
    await this.loadingService.withLoading(async () => {
      this.userId = this.data.userId;
      this.shippingAddressId = this.data.addresId;

      // if the userId isn't available then log out and navigate to home
      if (this.userId === undefined || this.userId === null || this.userId === "") {
        this.authService.logOut();
        this.dialog.closeAll();
        this.router.navigate(['/home']);
        return;
      }

      this.shippingAddress = {
        id: '',
        addressName: '',
        addressType: '',
        country: '',
        postalCode: '',
        city: '',
        street: '',
        streetType: '',
        houseNumber: '',
        isSetAsDefaultAddress: false,
        isBillingDifferentFromShipping: false,
        billingAddress: {
          addressName: '',
          country: '',
          postalCode: '',
          city: '',
          street: '',
          streetType: '',
          houseNumber: ''
        }
      }

      // if the user id and the address id is available then get from the injection
      if ((this.userId !== undefined && this.userId !== null && this.userId !== "") &&
        (this.shippingAddressId !== undefined && this.shippingAddressId !== null && this.shippingAddressId !== "")) {
        this.db.collection("users").doc(this.userId).collection("shippingAddresses").doc(this.shippingAddressId)
          .valueChanges().subscribe((shippingAddress: ShippingAddress) => {
            this.shippingAddress = shippingAddress;
            this.isEditing = true;

            // to the checkboxes
            if (this.shippingAddress.isSetAsDefaultAddress) {
              this.isSetAsDefaultAddress = true;
            }

            if (this.shippingAddress.companyName) {
              this.isCompanyAddressChecked = true;
            }

            // to the address name/category
            if (this.shippingAddress.addressType === AddressTypeText.HOME) {
              this.selectedAddressType = AddressTypeText.HOME;
              this.shippingAddress.addressName = this.translate.instant('profileMenu.shippingAddressForm.home')
            } else if (this.shippingAddress.addressType === AddressTypeText.WORK) {
              this.selectedAddressType = AddressTypeText.WORK;
              this.shippingAddress.addressName = this.translate.instant('profileMenu.shippingAddressForm.work')
            } else {
              this.selectedAddressType = AddressTypeText.OTHER;
            }
          });
      }
    });
  }

  toggleCompanyAddress() {
    if (!this.isCompanyAddressChecked) {
      this.shippingAddress.companyName = '';
      this.shippingAddress.taxNumber = '';
      this.shippingAddress.billingAddress = {
        addressName: '',
        country: '',
        postalCode: '',
        city: '',
        street: '',
        streetType: '',
        houseNumber: ''
      }
    }
  }

  // Function to change the selected address type
  selectAddressType(type: string) {
    this.selectedAddressType = type;
    if (type === AddressTypeText.HOME) {
      this.shippingAddress.addressName = AddressTypeText.HOME
    } else if (type === AddressTypeText.WORK) {
      this.shippingAddress.addressName = AddressTypeText.WORK
    } else {
      this.shippingAddress.addressName = "";
    }

    this.shippingAddress.addressType = type;

    this.errorMessage = false;
    this.missingAddressNameError = false;
  }

  async saveAddress() {
    if (this.shippingAddress.addressName === null || this.shippingAddress.addressName === undefined || this.shippingAddress.addressName === "") {
      this.missingAddressNameError = true;
      return;
    } else {
      await this.loadingService.withLoading(async () => {
        let errorCheck: boolean = false;

        // check what is the shipping address type, name because of the duplication check
        if (this.selectedAddressType === AddressTypeText.HOME || this.shippingAddress.addressName === "Home" || this.shippingAddress.addressName === "Otthon") {
          this.shippingAddress.addressType = AddressTypeText.HOME;
          this.shippingAddress.addressName = AddressTypeText.HOME;
          errorCheck = await this.documentumHandler.checkForDuplicationInnerCollection(
            "users", this.userId, "shippingAddresses", "addressType", AddressTypeText.HOME, undefined, this.shippingAddressId
          );
        }
        else if (this.selectedAddressType === AddressTypeText.WORK || this.shippingAddress.addressName === "Work" || this.shippingAddress.addressName === "Munkahely") {
          this.shippingAddress.addressType = AddressTypeText.WORK;
          this.shippingAddress.addressName = AddressTypeText.WORK;
          errorCheck = await this.documentumHandler.checkForDuplicationInnerCollection(
            "users", this.userId, "shippingAddresses", "addressType", AddressTypeText.WORK, undefined, this.shippingAddressId
          );
        }
        else {
          this.shippingAddress.addressType = AddressTypeText.OTHER;
          errorCheck = await this.documentumHandler.checkForDuplicationInnerCollection(
            "users", this.userId, "shippingAddresses", "addressName", this.shippingAddress.addressName, undefined, this.shippingAddressId
          );
        }

        if (errorCheck) {
          this.errorMessage = true;
          return; // Exit early if there's an error
        } else {
          this.errorMessage = false;
        }

      });

      // check if a default address already has been added before
      let defaultCheck = false;

      // if the user want to create a new default address
      if (this.shippingAddress.isSetAsDefaultAddress) {
        defaultCheck = await this.documentumHandler.checkForDuplicationInnerCollection(
          "users", this.userId, "shippingAddresses", "isSetAsDefaultAddress", undefined, this.shippingAddress.isSetAsDefaultAddress, this.shippingAddressId
        );
      }

      // If there's a default address already set, we need to handle it
      if (defaultCheck) {
        const dialogRef = this.dialog.open(ChangeDefaultAddressConfirmDialogComponent);

        // Wait for the dialog to close and get the user's confirmation
        const confirmToSetDefault = await dialogRef.afterClosed().toPromise();

        if (confirmToSetDefault) {
          // Find the address where isSetAsDefaultAddress is true
          const addressesRef = this.db.collection("users").doc(this.userId).collection("shippingAddresses").ref;
          const defaultAddressSnapshot = await addressesRef.where("isSetAsDefaultAddress", "==", true).limit(1).get();

          // Update the existing default address (if found) to set isSetAsDefaultAddress to false
          if (!defaultAddressSnapshot.empty) {
            const defaultAddress = defaultAddressSnapshot.docs[0];
            await defaultAddress.ref.update({ isSetAsDefaultAddress: false });
          }
        } else {
          // User did not confirm, exit the method
          return;
        }
      }

      // Prepare additional fields
      if (this.shippingAddress.taxNumber === undefined) {
        this.shippingAddress.taxNumber = '';
      }

      if (this.shippingAddress.companyName === undefined) {
        this.shippingAddress.companyName = '';
      }

      // Add the new address with isSetAsDefaultAddress set to true
      await this.loadingService.withLoading(async () => {
        try {
          if (this.isEditing) {
            await this.db.collection("users").doc(this.userId).collection("shippingAddresses").doc(this.shippingAddressId).update(this.shippingAddress);
          } else {
            const documentRef = await this.db.collection("users").doc(this.data.userId).collection("shippingAddresses").add(this.shippingAddress);
            await documentRef.update({ id: documentRef.id });
          }
          this.errorMessage = false;
          this.missingAddressNameError = false;

          // Close dialog with success and the updated address
          // This is used to update the address in the checkout page
          this.dialogRef.close({
            success: true,
            address: {
              id: this.shippingAddressId,
              addressName: this.shippingAddress.addressName,
              addressType: this.selectedAddressType,
              country: this.documentumHandler.makeUpperCaseEveryWordFirstLetter(this.shippingAddressForm.value.country),
              postalCode: this.shippingAddressForm.value.postalCode,
              city: this.documentumHandler.makeUpperCaseEveryWordFirstLetter(this.shippingAddressForm.value.city),
              street: this.documentumHandler.makeUpperCaseEveryWordFirstLetter(this.shippingAddressForm.value.streetName),
              streetType: this.shippingAddressForm.value.streetType,
              houseNumber: this.shippingAddressForm.value.houseNumber,
              floor: this.shippingAddressForm.value.floor,
              door: this.shippingAddressForm.value.door,
              isSetAsDefaultAddress: this.isSetAsDefaultAddress,
              taxNumber: this.shippingAddress.taxNumber,
              companyName: this.shippingAddress.companyName,
              isBillingDifferentFromShipping: this.shippingAddress.isBillingDifferentFromShipping,
              billingAddress: this.shippingAddress.billingAddress
            }
          });

          // Show success dialog
          this.dialog.open(SuccessfullDialogComponent, {
            data: {
              text: SuccessFullDialogText.MODIFIED_TEXT,
              needToGoPrevoiusPage: false
            }
          });
        } catch (error) {
          console.log(error);
          this.errorMessage = true;
        }
      });
    }

  }

  async deleteAddress() {

    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      data: {
        text: DeleteConfirmationText.SHIPPING_ADDRESS_DELETE
      }
    });

    const confirmToDeleteAddress = await dialogRef.afterClosed().toPromise();

    if (confirmToDeleteAddress) {
      await this.loadingService.withLoading(async () => {
        try {
          const deleteAddressRef = this.db.collection("users").doc(this.userId).collection("shippingAddresses").doc(this.shippingAddressId);
          await deleteAddressRef.delete();
          this.back();
          this.dialog.open(SuccessfullDialogComponent, {
            data: {
              text: SuccessFullDialogText.DELETED_TEXT,
              needToGoPrevoiusPage: false
            }
          });
        } catch { }
      });
    }

  }

  // Close the dialog with success false to update the address in the checkout page
  back() {
    this.dialogRef.close({ success: false });
  }
}
