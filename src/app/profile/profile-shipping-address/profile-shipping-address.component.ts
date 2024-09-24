import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ShippingAddress } from '../../user/shipping-address.model';

@Component({
  selector: 'app-profile-shipping-address',
  templateUrl: './profile-shipping-address.component.html',
  styleUrl: '../../../styles/basic-form.scss',
})
export class ProfileShippingAddressComponent {
  @ViewChild('form') addressForm: NgForm;

  newAddress: ShippingAddress;
  addresses: ShippingAddress[];
  // Add a new address to the list
  goToAddNewAddress() {

  }

  // Remove an address from the list
  removeAddress(index: number) {

  }
}
