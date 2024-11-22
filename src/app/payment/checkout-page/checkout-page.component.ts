import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { CartService } from '../../cart/cart.service';
import { ShippingAddress } from '../../profile/profile-shipping-address/shipping-address.model';
import { User } from '../../profile/user.model';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { Location } from '@angular/common';
import { CartItem } from '../../cart/cart.model';
import { EditShippingAddressComponent } from '../../profile/profile-shipping-address/edit-shipping-address/edit-shipping-address.component';
import { MatDialog } from '@angular/material/dialog';
import { ShippingAddressSelectionDialogComponent } from '../shipping-address-selection-dialog/shipping-address-selection-dialog.component';
import { ProductViewText } from '../../admin-profile/product-management/product-view-texts';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';

@Component({
  selector: 'app-checkout-page',
  templateUrl: './checkout-page.component.html',
  styleUrl: './checkout-page.component.scss',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('500ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ]),
    trigger('zoomIn', [
      transition(':enter', [
        style({ transform: 'scale(0.95)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('slideUp', [
      transition(':enter', [
        style({ transform: 'translateY(100%)' }),
        animate('300ms ease-out', style({ transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateY(100%)' }))
      ])
    ]),
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
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
  ],
})
export class CheckoutPageComponent implements OnInit {
  @ViewChild('form') guestForm: NgForm;  // Access the form for validation
  cartItems: any[] = [];
  subtotal: number = 0;
  shipping: number = 2500; // Fix shipping cost
  total: number = 0;

  userLoggedIn: boolean = false;
  shippingAddress: ShippingAddress;
  currentUserId: string = '';
  currentUser: User;

  // guest form
  displayGuestForm: boolean = false;
  isEditGuestForm: boolean = false;
  guestFirstName: string = '';
  guestLastName: string = '';
  guestEmail: string = '';
  guestPhone: string = '';

  selectedPaymentMethod: string = '';
  paymentMethods = [
    {
      id: 'card',
      name: ProductViewText.CHECKOUT_PAY_WITH_STRIPE,
      description: ProductViewText.CHECKOUT_PAY_WITH_STRIPE_DESCRIPTION,
      icon: 'credit-card-outline',
      additionalFee: 0
    },
    {
      id: 'cash',
      name: ProductViewText.CHECKOUT_PAY_WITH_CASH,
      description: ProductViewText.CHECKOUT_PAY_WITH_CASH_DESCRIPTION,
      icon: 'shopping-bag-outline',
      additionalFee: 1000
    }
  ];

  shippingMethods = [
    {
      id: 'store',
      name: ProductViewText.CHECKOUT_SHIPPING_STORE_PICKUP_TITLE,
      description: ProductViewText.CHECKOUT_SHIPPING_STORE_PICKUP_DESCRIPTION,
      price: 0,
      icon: 'home-outline',
      estimatedDays: '1-2'
    },
    {
      id: 'dhl',
      name: ProductViewText.CHECKOUT_SHIPPING_DHL_TITLE,
      description: ProductViewText.CHECKOUT_SHIPPING_DHL_DESCRIPTION,
      price: 2500,
      icon: 'car-outline',
      estimatedDays: '3-5'
    }
  ];

  selectedShippingMethod: string = '';

  // loyalty program
  currentLoyaltyPoints: number = 0;
  nextRewardThreshold: number = 0;

  showAddressForm = false;
  isSubmitting = false;
  addressForm: FormGroup;

  constructor(
    private cartService: CartService,
    private auth: AngularFireAuth,
    private authService: AuthService,
    private router: Router,
    private db: AngularFirestore,
    private location: Location,
    private dialog: MatDialog,
    private changeDetector: ChangeDetectorRef
  ) { }

  ngOnInit() {
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
      deleted: false
    }
    this.loadCartItems();
    this.checkAuthStatus();
  }

  loadCartItems() {
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      if (this.cartItems.length === 0) {
        this.router.navigate(['/']);
      }
      this.calculateTotals();
    });
  }

  checkAuthStatus() {
    // check if user logged in for reviews
    this.auth.authState.subscribe((userAuth) => {
      if (userAuth) {
        this.userLoggedIn = true;
        this.authService.getCurrentUser(userAuth.uid).subscribe((currentUser: User) => {
          this.currentUser = currentUser;
          this.currentUserId = currentUser.id;
          this.currentLoyaltyPoints = currentUser.loyaltyPoints || 0;
          if (this.currentLoyaltyPoints <= 300) {
            this.nextRewardThreshold = 300;
          } else if (this.currentLoyaltyPoints <= 600) {
            this.nextRewardThreshold = 600;
          } else if (this.currentLoyaltyPoints <= 700) {
            this.nextRewardThreshold = 700;
          } else if (this.currentLoyaltyPoints <= 850) {
            this.nextRewardThreshold = 850;
          } else if (this.currentLoyaltyPoints > 850) {
            this.nextRewardThreshold = 1500;
          }
          this.getDefaultAddress(currentUser).then((address) => {
            this.shippingAddress = address;
          });
          if (this.currentUser === undefined) {
            this.userLoggedIn = false; // User is logged out
            this.displayGuestForm = true;
          }
        });
      } else {
        this.userLoggedIn = false; // User is logged out
        this.displayGuestForm = true;
      }
    });
  }

  async getDefaultAddress(user: User): Promise<ShippingAddress | null> {
    // Find the address where isSetAsDefaultAddress is true
    const addressesRef = this.db.collection("users").doc(user.id).collection("shippingAddresses").ref;
    const defaultAddressSnapshot = await addressesRef.where("isSetAsDefaultAddress", "==", true).limit(1).get();

    if (defaultAddressSnapshot.empty) {
      return null;
    }

    const defaultAddressDoc = defaultAddressSnapshot.docs[0];
    return {
      id: defaultAddressDoc.id,
      ...defaultAddressDoc.data()
    } as ShippingAddress;
  }

  openLoyalityProgram() {
    this.router.navigate(['product/loyaltyProgram']);
  }

  calculateTotals() {
    this.subtotal = this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.total = this.subtotal + this.shipping;
  }

  goToProduct(product: CartItem) {
    this.router.navigate(['/product', product.category, product.productId]);
  }

  // Go to Edit Address
  editAddress() {
    const dialogRef = this.dialog.open(ShippingAddressSelectionDialogComponent, {
      data: {
        userId: this.currentUserId
      }
    });

    dialogRef.afterClosed().subscribe((result: ShippingAddress) => {
      if (result) {
        this.shippingAddress = result;
        this.changeDetector.detectChanges();
      }
    });
  }

  addNewGuestAddress() {
    this.shippingAddress = this.guestForm.value;
    this.shippingAddress.addressName = ProductViewText.CHECKOUT_GUEST_ADDRESS_NAME;
    this.displayGuestForm = false;
    this.isEditGuestForm = true;
  }

  editGuestForm() {
    this.displayGuestForm = true;
  }

  openAddressSelection() {
    const dialogRef = this.dialog.open(ShippingAddressSelectionDialogComponent, {
      data: {
        userId: this.currentUserId
      }
    });

    dialogRef.afterClosed().subscribe((result: ShippingAddress) => {
      if (result) {
        this.shippingAddress = result;
        this.changeDetector.detectChanges();
      }
    });
  }

  selectShippingMethod(methodId: string) {
    this.selectedShippingMethod = methodId;

    if (methodId === 'store') {
      this.shipping = 0;
    } else {
      this.shipping = 2500;
    }
    this.calculateTotals();
  }

  calculateTotal(): number {
    const baseTotal = this.subtotal + this.shipping;
    const paymentMethod = this.paymentMethods.find(m => m.id === this.selectedPaymentMethod);
    const paymentFee = paymentMethod?.additionalFee || 0;
    return baseTotal + paymentFee;
  }

  get paymentFee(): number {
    const paymentMethod = this.paymentMethods.find(m => m.id === this.selectedPaymentMethod);
    return paymentMethod?.additionalFee || 0;
  }

  calculateLoyaltyPoints(): number {
    return Math.floor(this.total / 100);
  }

  getLoyaltyProgress(): number {
    const totalPoints = this.currentLoyaltyPoints + this.calculateLoyaltyPoints();
    return (totalPoints / this.nextRewardThreshold) * 100;
  }

  getPointsToNextReward(): number {
    const totalPoints = this.currentLoyaltyPoints + this.calculateLoyaltyPoints();
    return this.nextRewardThreshold - totalPoints;
  }

  navigateToLogin() {
    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: '/checkout' }
    });
  }

  navigateToRegister() {
    this.router.navigate(['/auth/register'], {
      queryParams: { returnUrl: '/checkout' }
    });
  }

  async onPostalCodeBlur() {
    const postalCode = this.addressForm.get('postalCode')?.value;
    if (postalCode && postalCode.length === 4) {
      try {
        // Here you could add logic to auto-fill city based on postal code
      } catch (error) {
        console.error('Failed to fetch city:', error);
      }
    }
  }

  async onAddressSubmit() {
    if (this.addressForm.valid) {
      this.isSubmitting = true;
      try {
        // Handle address submission
        console.log('Address submitted:', this.addressForm.value);
      } catch (error) {
        console.error('Failed to submit address:', error);
      } finally {
        this.isSubmitting = false;
      }
    }
  }

  proceedToPayment() {

  }

  back() {
    this.location.back();
  }

}
