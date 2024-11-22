import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, Inject, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../auth/auth.service';
import { DocumentHandlerService } from '../../../document.handler.service';
import { SuccessfullDialogComponent } from '../../../successfull-dialog/successfull-dialog.component';
import { SuccessFullDialogText } from '../../../successfull-dialog/sucessfull-dialog-text';
import { AddressTypeText } from '../../profile-address-type-text';
import { ChangeDefaultAddressConfirmDialogComponent } from '../change-default-address-confirm-dialog/change-default-address-confirm-dialog.component';
import { ShippingAddress } from '../shipping-address.model';
import { DeleteConfirmationText } from '../../../delete-confirmation-dialog/delete-text';
import { DeleteConfirmationDialogComponent } from '../../../delete-confirmation-dialog/delete-confirmation-dialog.component';

@Component({
  selector: 'app-edit-shipping-address',
  templateUrl: './edit-shipping-address.component.html',
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
export class EditShippingAddressComponent {
  // for UI elements
  @ViewChild('form') modifyShippingAddressForm: NgForm;
  errorMessage = false;
  missingAddressNameError = false;
  modifiedAddressIsDefault = false;
  isCompanyAddressChecked: boolean = false;
  isSetAsDefaultAddress: boolean = false;
  userId: string;
  modifyShippingAddress: ShippingAddress;
  modifyShippingAddressId: string;

  // Check if these field are undefinied
  companyName: string = "";
  taxNumber: string = "";
  addressName: string = "";
  selectedAddressType: string; // Default selected address type

  // the tag, name for the address type
  addressTypeTexts = AddressTypeText;

  constructor(private dialog: MatDialog, private dialogRef: MatDialogRef<EditShippingAddressComponent>, @Inject(MAT_DIALOG_DATA) public data, private documentumHandler: DocumentHandlerService, private db: AngularFirestore, private auth: AngularFireAuth, private authService: AuthService, private router: Router, private translate: TranslateService) {
    this.userId = data.userId;
    this.modifyShippingAddressId = data.addresId;

    // if the userId isn't available then log out and navigate to home
    if (this.userId === undefined || this.userId === null || this.userId === "") {
      this.authService.logOut();
      this.dialog.closeAll();
      this.router.navigate(['/home']);
    }

    // if the shipping address id isn't available then hide this dialog
    if (this.modifyShippingAddressId === undefined || this.modifyShippingAddressId === null || this.modifyShippingAddressId === "") {
      this.back();
    }

    // if the user id and the address id is available then get from the injection
    if ((this.userId !== undefined && this.userId !== null && this.userId !== "") && (this.modifyShippingAddressId !== undefined && this.modifyShippingAddressId !== null && this.modifyShippingAddressId !== "")) {
      db.collection("users").doc(this.userId).collection("shippingAddresses").doc(this.modifyShippingAddressId).valueChanges().subscribe((shippingAddress: ShippingAddress) => {
        this.modifyShippingAddress = shippingAddress;

        // to the checkboxes
        if (this.modifyShippingAddress.isSetAsDefaultAddress) {
          this.isSetAsDefaultAddress = true;
        }

        if (this.modifyShippingAddress.companyName) {
          this.isCompanyAddressChecked = true;
        }

        // to the address name/category
        if (this.modifyShippingAddress.addressType === AddressTypeText.HOME) {
          this.selectedAddressType = AddressTypeText.HOME;
          this.addressName = this.translate.instant('profileMenu.shippingAddressForm.home')
        }

        else if (this.modifyShippingAddress.addressType === AddressTypeText.WORK) {
          this.selectedAddressType = AddressTypeText.WORK;
          this.addressName = this.translate.instant('profileMenu.shippingAddressForm.work')
        }

        else {
          this.selectedAddressType = AddressTypeText.OTHER;
          this.addressName = this.modifyShippingAddress.addressName;
        }
      });
    }
  }

  // Function to change the selected address type
  selectAddressType(type: string) {
    this.selectedAddressType = type;
    if (type === AddressTypeText.HOME) {
      this.addressName = this.translate.instant('profileMenu.shippingAddressForm.home')
    } else if (type === AddressTypeText.WORK) {
      this.addressName = this.translate.instant('profileMenu.shippingAddressForm.work')
    } else {
      this.addressName = "";
    }

    this.errorMessage = false;
    this.missingAddressNameError = false;
  }

  async modifyAddress() {
    if (this.selectedAddressType === AddressTypeText.OTHER) {
      this.addressName = this.modifyShippingAddressForm.value.addressName;
    }
    if (this.addressName === null || this.addressName === undefined || this.addressName === "") {
      this.missingAddressNameError = true;
    } else {
      let errorCheck: boolean = false;

      // check what is the shipping address type, name because of the duplication check
      if (this.selectedAddressType === AddressTypeText.HOME) {
        errorCheck = await this.documentumHandler.checkForDuplicationInnerCollection(
          "users", this.userId, "shippingAddresses", "addressType", AddressTypeText.HOME, undefined, this.modifyShippingAddressId
        );
      }
      else if (this.selectedAddressType === AddressTypeText.WORK) {
        errorCheck = await this.documentumHandler.checkForDuplicationInnerCollection(
          "users", this.userId, "shippingAddresses", "addressType", AddressTypeText.WORK, undefined, this.modifyShippingAddressId
        );
      }
      else {
        errorCheck = await this.documentumHandler.checkForDuplicationInnerCollection(
          "users", this.userId, "shippingAddresses", "addressName", this.addressName, undefined, this.modifyShippingAddressId
        );
      }

      if (errorCheck) {
        this.errorMessage = true;
        return; // Exit early if there's an error
      } else {
        this.errorMessage = false;
      }

      // check if a default address already has been added before
      let defaultCheck = false;

      // if the user want to create a new default address
      if (this.isSetAsDefaultAddress) {
        defaultCheck = await this.documentumHandler.checkForDuplicationInnerCollection(
          "users", this.userId, "shippingAddresses", "isSetAsDefaultAddress", undefined, this.isSetAsDefaultAddress, this.modifyShippingAddressId
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
      if (this.modifyShippingAddressForm.value.taxNumber !== undefined && this.modifyShippingAddressForm.value.taxNumber !== null) {
        this.taxNumber = this.modifyShippingAddressForm.value.taxNumber;
      }

      if (this.modifyShippingAddressForm.value.companyName !== undefined && this.modifyShippingAddressForm.value.companyName !== null) {
        this.companyName = this.modifyShippingAddressForm.value.companyName;
      }

      // Add the new address with isSetAsDefaultAddress set to true
      try {
        await this.db.collection("users").doc(this.userId).collection("shippingAddresses").doc(this.modifyShippingAddressId).update({
          id: this.modifyShippingAddressId,
          addressName: this.documentumHandler.makeUpperCaseEveryWordFirstLetter(this.addressName),
          addressType: this.selectedAddressType,
          country: this.documentumHandler.makeUpperCaseEveryWordFirstLetter(this.modifyShippingAddressForm.value.country),
          postalCode: this.modifyShippingAddressForm.value.postalCode,
          city: this.documentumHandler.makeUpperCaseEveryWordFirstLetter(this.modifyShippingAddressForm.value.city),
          street: this.documentumHandler.makeUpperCaseEveryWordFirstLetter(this.modifyShippingAddressForm.value.streetName),
          streetType: this.modifyShippingAddressForm.value.streetType,
          houseNumber: this.modifyShippingAddressForm.value.houseNumber,
          floor: this.modifyShippingAddressForm.value.floor,
          door: this.modifyShippingAddressForm.value.door,
          isSetAsDefaultAddress: this.isSetAsDefaultAddress,
          taxNumber: this.taxNumber,
          companyName: this.companyName
        });
        this.errorMessage = false;
        this.missingAddressNameError = false;

        // Close dialog with success and the updated address
        // This is used to update the address in the checkout page
        this.dialogRef.close({
          success: true,
          address: {
            id: this.modifyShippingAddressId,
            addressName: this.documentumHandler.makeUpperCaseEveryWordFirstLetter(this.addressName),
            addressType: this.selectedAddressType,
            country: this.documentumHandler.makeUpperCaseEveryWordFirstLetter(this.modifyShippingAddressForm.value.country),
            postalCode: this.modifyShippingAddressForm.value.postalCode,
            city: this.documentumHandler.makeUpperCaseEveryWordFirstLetter(this.modifyShippingAddressForm.value.city),
            street: this.documentumHandler.makeUpperCaseEveryWordFirstLetter(this.modifyShippingAddressForm.value.streetName),
            streetType: this.modifyShippingAddressForm.value.streetType,
            houseNumber: this.modifyShippingAddressForm.value.houseNumber,
            floor: this.modifyShippingAddressForm.value.floor,
            door: this.modifyShippingAddressForm.value.door,
            isSetAsDefaultAddress: this.isSetAsDefaultAddress,
            taxNumber: this.taxNumber,
            companyName: this.companyName
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
        this.errorMessage = true;
      }
    }
  }

  async deleteAddress() {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      data: {
        text: DeleteConfirmationText.SHIPPING_ADDRESS_DELETE
      }
    });

    // Wait for the dialog to close and get the user's confirmation
    const confirmToDeleteAddress = await dialogRef.afterClosed().toPromise();

    if (confirmToDeleteAddress) {
      try {
        const deleteAddressRef = this.db.collection("users").doc(this.userId).collection("shippingAddresses").doc(this.modifyShippingAddressId);
        await deleteAddressRef.delete();
        this.back();
        this.dialog.open(SuccessfullDialogComponent, {
          data: {
            text: SuccessFullDialogText.DELETED_TEXT,
            needToGoPrevoiusPage: false
          }
        });
      } catch { }
    }
  }

  // Close the dialog with success false to update the address in the checkout page
  back() {
    this.dialogRef.close({ success: false });
  }
}
