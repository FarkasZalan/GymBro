import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { SuccessfullDialogComponent } from '../../../successfull-dialog/successfull-dialog.component';
import { SuccessFullDialogText } from '../../../successfull-dialog/sucessfull-dialog-text';
import { DocumentHandlerService } from '../../../document.handler.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthService } from '../../../auth/auth.service';
import { User } from '../../../user/user.model';
import { Router } from '@angular/router';
import { ChangeDefaultAddressConfirmDialogComponent } from '../change-default-address-confirm-dialog/change-default-address-confirm-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { AddressTypeText } from '../../profile-address-type-text';

@Component({
  selector: 'app-create-shipping-address',
  templateUrl: './create-shipping-address.component.html',
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
export class CreateShippingAddressComponent implements OnInit {
  // for UI elements
  @ViewChild('form') createShippingAddressForm: NgForm;
  errorMessage = false;
  missingAddressNameError = false;
  newAddressIsDefault = false;
  isCompanyAddressChecked: boolean = false;
  isSetAsDefaultAddress: boolean = false;
  userId: string;

  // Check if these field are undefinied
  companyName: string = "";
  taxNumber: string = "";
  addressName: string = "";
  selectedAddressType: string; // Default selected address type

  // the tag, name for the address type
  addressTypeTexts = AddressTypeText;

  constructor(private dialog: MatDialog,
    private documentumHandler: DocumentHandlerService,
    private db: AngularFirestore,
    private auth: AngularFireAuth,
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService) { }

  ngOnInit(): void {
    //load the current user
    this.auth.authState.subscribe((userAuth) => {
      if (userAuth) {
        this.authService.getCurrentUser(userAuth.uid).subscribe((currentUser: User) => {
          this.userId = currentUser.id;

          // if no user logged-in then redirect to home page
          if (this.userId === null) {
            this.authService.logOut();
            this.dialog.closeAll();
            this.router.navigate(['/home']);
          }
        })
      }
    })
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
  }

  async addNewAddress() {
    if (this.selectedAddressType === AddressTypeText.OTHER) {
      this.addressName = this.createShippingAddressForm.value.addressName;
    }
    if (this.addressName === null || this.addressName === undefined || this.addressName === "") {
      this.missingAddressNameError = true;
    } else {
      let errorCheck: boolean = false;

      // check what is the shipping address type, name because of the duplication check
      if (this.selectedAddressType === AddressTypeText.HOME) {
        this.addressName = AddressTypeText.HOME;
        errorCheck = await this.documentumHandler.checkForDuplicationInnerCollection(
          "users", this.userId, "shippingAddresses", "addressType", AddressTypeText.HOME, undefined, ""
        );
      }
      else if (this.selectedAddressType === AddressTypeText.WORK) {
        this.addressName = AddressTypeText.WORK;
        errorCheck = await this.documentumHandler.checkForDuplicationInnerCollection(
          "users", this.userId, "shippingAddresses", "addressType", AddressTypeText.WORK, undefined, ""
        );
      }
      else {
        errorCheck = await this.documentumHandler.checkForDuplicationInnerCollection(
          "users", this.userId, "shippingAddresses", "addressName", this.addressName, undefined, ""
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
          "users", this.userId, "shippingAddresses", "isSetAsDefaultAddress", undefined, this.isSetAsDefaultAddress, ""
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
      if (this.createShippingAddressForm.value.taxNumber !== undefined && this.createShippingAddressForm.value.taxNumber !== null) {
        this.taxNumber = this.createShippingAddressForm.value.taxNumber;
      }

      if (this.createShippingAddressForm.value.companyName !== undefined && this.createShippingAddressForm.value.companyName !== null) {
        this.companyName = this.createShippingAddressForm.value.companyName;
      }

      // Add the new address with isSetAsDefaultAddress set to true
      try {
        const documentumRef = await this.db.collection("users").doc(this.userId).collection("shippingAddresses").add({
          id: "",
          addressName: this.documentumHandler.makeUpperCaseEveryWordFirstLetter(this.addressName),
          addressType: this.selectedAddressType,
          country: this.documentumHandler.makeUpperCaseEveryWordFirstLetter(this.createShippingAddressForm.value.country),
          postalCode: this.createShippingAddressForm.value.postalCode,
          city: this.documentumHandler.makeUpperCaseEveryWordFirstLetter(this.createShippingAddressForm.value.city),
          street: this.documentumHandler.makeUpperCaseEveryWordFirstLetter(this.createShippingAddressForm.value.streetName),
          streetType: this.createShippingAddressForm.value.streetType,
          houseNumber: this.createShippingAddressForm.value.houseNumber,
          floor: this.createShippingAddressForm.value.floor,
          door: this.createShippingAddressForm.value.door,
          isSetAsDefaultAddress: this.isSetAsDefaultAddress,
          taxNumber: this.taxNumber,
          companyName: this.companyName
        });
        // id the document created then save the document id in the field
        await documentumRef.update({ id: documentumRef.id });
        this.errorMessage = false;
        this.missingAddressNameError = false;
        this.back();
        // if everything was succes then open successfull dialog
        this.dialog.open(SuccessfullDialogComponent, {
          data: {
            text: SuccessFullDialogText.CREATED_TEXT,
            needToGoPrevoiusPage: false
          }
        });
      } catch (error) {
        this.errorMessage = true;
      }
    }
  }

  back() {
    this.dialog.closeAll();
  }
}
