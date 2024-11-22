import { Component, OnInit } from '@angular/core';
import { ShippingAddress } from './shipping-address.model';
import { MatDialog } from '@angular/material/dialog';
import { CreateShippingAddressComponent } from './create-shipping-address/create-shipping-address.component';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { User } from '../user.model';
import { TranslateService } from '@ngx-translate/core';
import { EditShippingAddressComponent } from './edit-shipping-address/edit-shipping-address.component';
import { AddressTypeText } from '../profile-address-type-text';

@Component({
  selector: 'app-profile-shipping-address',
  templateUrl: './profile-shipping-address.component.html',
  styleUrl: '../../../styles/basic-form.scss',
})
export class ProfileShippingAddressComponent implements OnInit {
  userId: string;
  shippingAddresses: ShippingAddress[];

  constructor(private dialog: MatDialog,
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
          } else {
            this.getAllShippingAddress(this.userId);
          }
        })
      }
    })
  }

  // Add a new address to the list
  goToAddNewAddress() {
    this.dialog.open(CreateShippingAddressComponent);
  }

  // Go to Edit Address
  editAddress(addresId: string) {
    this.dialog.open(EditShippingAddressComponent, {
      data: {
        addresId: addresId, // pass the clicked address id and the current user id to the edit component
        userId: this.userId
      }
    });
  }

  getAllShippingAddress(userId: string) {
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
          this.shippingAddresses = this.shippingAddresses.map((address: ShippingAddress) => {
            // Check for "home", "otthon", "work", or "munkahely" and translate accordingly
            if (address.addressType === AddressTypeText.HOME) {
              address.addressName = translations['profileMenu.shippingAddressForm.home'];
            }
            if (address.addressType === AddressTypeText.WORK) {
              address.addressName = translations['profileMenu.shippingAddressForm.work'];
            }
            return address;
          });

          // Sort the addresses after applying the translations
          this.shippingAddresses = this.sortAddresses(this.shippingAddresses);
        });
      });
  }


  // Method to sort addresses: default first, then by addressName
  sortAddresses(addresses: ShippingAddress[]): ShippingAddress[] {
    const defaultAddress = addresses.find(address => address.isSetAsDefaultAddress);
    const nonDefaultAddresses = addresses.filter(address => !address.isSetAsDefaultAddress);

    // Sort non-default addresses by addressName
    nonDefaultAddresses.sort((a, b) => a.addressName.localeCompare(b.addressName));

    // Return array with the default address first (if it exists) followed by the sorted non-default addresses
    return defaultAddress ? [defaultAddress, ...nonDefaultAddresses] : nonDefaultAddresses;
  }
}
