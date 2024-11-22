import { trigger, state, style, transition, animate } from '@angular/animations';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CurrencyPipe, Location } from '@angular/common';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { Clothes } from '../../../admin-profile/product-management/product-models/clothing.model';
import { ProductReeviews } from '../../../admin-profile/product-management/product-models/product-reviews.model';
import { ProductViewText } from '../../../admin-profile/product-management/product-view-texts';
import { AuthService } from '../../../auth/auth.service';
import { CartService } from '../../../cart/cart.service';
import { DocumentHandlerService } from '../../../document.handler.service';
import { User } from '../../../profile/user.model';
import { ProductService } from '../../product.service';
import { ReviewHandleComponent } from '../../review-handle/review-handle.component';

@Component({
  selector: 'app-clothes-page',
  templateUrl: './clothes-page.component.html',
  styleUrl: '../../../../styles/product-page-view.scss',
  animations: [
    // name of tha animation what can call in html
    trigger('collapseComponent', [
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
    ]),

    trigger('zoomIn', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('250ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
    ])
  ]
})
export class ClothesPageComponent implements OnInit {
  @ViewChild('userLoggedOutLikeErrorMessage') errorMessage: ElementRef;
  @ViewChild('reviewsSection') reviewsSection: ElementRef;
  clothes: Clothes;
  selectedSizeInProduct: string = '';
  productViewText = ProductViewText;

  selectedPrice: number = 0;
  selectedImage: string = '';

  // sizes and colors
  availableSizes: string[] = [];
  availableColors: string[] = [];
  selectedColor: string = '';

  // gender
  availableGenders: string[] = [
    ProductViewText.MALE,
    ProductViewText.FEMALE,
    ProductViewText.UNISEX
  ];
  selectedGender: string = '';

  // clothing type
  availableClothingTypes: string[] = [
    ProductViewText.COAT,
    ProductViewText.PANTS,
    ProductViewText.SWEATER,
    ProductViewText.T_SHIRT,
    ProductViewText.SPORTS_BRA,
    ProductViewText.TANK_TOP
  ];
  selectedClothingType: string = '';

  // clothing material
  availableMaterials: string[] = [
    ProductViewText.BLENDED_FIBER,
    ProductViewText.COTTON,
  ];
  selectedMaterial: string = '';

  isCollapsedDescription: boolean = true;
  isCollapsedReturn: boolean = true;
  isColorDropdownOpen: boolean = false;

  relatedProducts: Clothes[] = [];

  // cart, unit price and loyality program
  unitPrice: number = 0;
  unitPriceUnit: string = '';
  cartQuantity: number = 1;
  loyaltyPoints: number = 0;

  productIsInStock: boolean = true;
  productStock: number = 0;

  errorMessageStock: boolean = false;

  // reviews
  // Need two arrays for the reviews, one for the display the reviews and one for handling the reviews likes
  displayedReviews: ProductReeviews[] = []; // Display data - gets sorted
  originalReviews: ProductReeviews[] = [];  // Original data - never sorted
  averageRating: number = 0;
  userLoggedIn: boolean = false;
  userReview: User;
  currentUserId: string = '';
  userLoggedOutError: boolean = false;
  userLoggedOutLikeError: boolean = false;
  productId: string = '';
  isProductInCart: boolean = false;

  // show all reviews
  showAllReviews: boolean = false;
  readonly initialReviewCount: number = 3;

  //filter reviews
  availableReviewFilters: string[] = [
    ProductViewText.ORDER_BY_OLDEST,
    ProductViewText.ORDER_BY_LATEST,
    ProductViewText.ORDER_BY_WORST_RATING,
    ProductViewText.ORDER_BY_BEST_RATING
  ];
  currentSortOrder: string = ProductViewText.ORDER_BY_LATEST;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private documentHandler: DocumentHandlerService,
    private changeDetector: ChangeDetectorRef,
    private location: Location,
    private productService: ProductService,
    private auth: AngularFireAuth,
    private db: AngularFirestore,
    private authService: AuthService,
    private dialog: MatDialog,
    private cartService: CartService,
    private currencyPipe: CurrencyPipe) { }

  ngOnInit(): void {
    this.clothes = {
      id: "",
      productName: "",
      smallDescription: "",
      productGender: "",
      description: "",
      clothingType: "",
      material: "",

      prices: []
    }

    // check if user logged in for reviews
    this.auth.authState.subscribe((userAuth) => {
      if (userAuth) {
        this.userLoggedIn = true;
        this.authService.getCurrentUser(userAuth.uid).subscribe((currentUser: User) => {
          this.userReview = currentUser;
          this.currentUserId = currentUser.id;
          if (this.userReview === undefined) {
            this.userLoggedIn = false; // User is logged out
          }
        });
      } else {
        this.userLoggedIn = false; // User is logged out
      }
    });

    this.route.params.subscribe(params => {
      // get the food supliment product by id
      this.documentHandler.getInnerDocumentByID("products", ProductViewText.CLOTHES, "allProduct", params['productId']).subscribe(async (clothes: Clothes) => {
        // make a copy from the object
        this.clothes = { ...clothes };
        this.productId = clothes.id;
        console.log(clothes.prices);

        this.selectedGender = clothes.productGender;
        this.selectedClothingType = clothes.clothingType;
        this.selectedMaterial = clothes.material;
        this.selectedColor = this.getDefaultPrice(clothes).productColor;

        this.selectedSizeInProduct = this.getDefaultPrice(clothes).productSize;
        this.selectedPrice = this.getDefaultPrice(clothes).productPrice;
        this.loyaltyPoints = Math.round(this.selectedPrice / 100);
        this.selectedImage = this.getDefaultPrice(clothes).productImage;
        this.getReviews();

        this.getAvailableColors(true);

        if (this.getDefaultPrice(clothes).productStock === 0) {
          this.productIsInStock = false;
        } else {
          this.productIsInStock = true;
        }

        this.loadRelatedProducts();
      });
    });
  }

  // Function to get unique sizes for display
  getUniqueSizes() {
    return Array.from(new Set(this.clothes.prices.map(price => price.productSize)));
  }

  // Method to get the default price for a the products
  getDefaultPrice(clothes: Clothes) {
    return clothes.prices.find(price => price.setAsDefaultPrice);
  }

  // navigateto the product page
  goToProductPage(productId: string) {
    this.router.navigate(['product/' + ProductViewText.CLOTHES + '/' + productId])
  }

  // get the available flavors for the selected quantity
  // if defaultPriceSelect is false, the first flavor will be selected (this is necessary for the default price)
  getAvailableColors(defaultPriceSelect: boolean) {
    // Filter prices based on selected size instead of price
    const filteredPrices = this.clothes.prices.filter(price =>
      price.productSize === this.selectedSizeInProduct
    );

    // Get unique colors for this size
    this.availableColors = Array.from(new Set(filteredPrices.map(price => price.productColor)));
    if (!defaultPriceSelect) {
      this.selectedColor = this.availableColors[0];
    }
    this.updateSelectedPriceAndStock();
  }

  selectSize(selectedSize: string) {
    this.selectedSizeInProduct = selectedSize;
    this.selectedPrice = this.getPriceBasedOnSize(this.clothes, selectedSize).productPrice;
    this.loyaltyPoints = Math.round(this.selectedPrice / 100);
    this.selectedImage = this.getPriceBasedOnSize(this.clothes, selectedSize).productImage;

    this.getAvailableColors(false);

    if (this.getPriceBasedOnSize(this.clothes, selectedSize).productStock === 0) {
      this.productIsInStock = false;
    } else {
      this.productIsInStock = true;
    }
    this.updateSelectedPriceAndStock();

    // Trigger animation by re-rendering
    this.changeDetector.detectChanges();
  }

  selectColor(color: string) {
    this.selectedColor = color;
    this.updateSelectedPriceAndStock();
  }

  updateSelectedPriceAndStock() {
    const selectedPriceObject = this.clothes.prices.find(price =>
      price.productColor === this.selectedColor &&
      price.productSize === this.selectedSizeInProduct
    );

    if (selectedPriceObject) {
      this.selectedPrice = selectedPriceObject.productPrice;
      this.productStock = selectedPriceObject.productStock;
      this.loyaltyPoints = Math.round(this.selectedPrice / 100);
      this.productIsInStock = selectedPriceObject.productStock > 0;
      this.selectedImage = selectedPriceObject.productImage;
    }
  }

  getPriceBasedOnSize(clothes: Clothes, selectedSize: string) {
    return clothes.prices.find(priceObj => priceObj.productSize === selectedSize);
  }

  toggleCollapsedDescription() {
    this.isCollapsedDescription = !this.isCollapsedDescription;

    if (!this.isCollapsedDescription) {
      this.isCollapsedReturn = true;
    }
  }

  toggleCollapsedReturn() {
    this.isCollapsedReturn = !this.isCollapsedReturn;

    if (!this.isCollapsedReturn) {
      this.isCollapsedDescription = true;
    }
  }

  toggleColorDropdown() {
    this.isColorDropdownOpen = !this.isColorDropdownOpen;
  }

  // get related products list
  loadRelatedProducts(): void {
    // Fetch related products based on tags and language
    this.productService.getRelatedProductsByGender(this.clothes.id, this.clothes.productGender, ProductViewText.CLOTHES).subscribe((relatedProducts: Clothes[]) => {
      // Create a Set to track unique product id
      const existingIds = new Set<string>();

      // Add IDs of the related products to the Set
      relatedProducts.forEach(product => existingIds.add(product.id!));

      // Handle related products based on their count
      if (relatedProducts.length > 0) {
        this.relatedProducts = relatedProducts; // Set the found related products
      }
      else if (relatedProducts.length === 0) {
        // No related products found, fetch three random blogs
        this.productService.getRandomProducts(this.clothes.id, 3, ProductViewText.CLOTHES).subscribe((randomBlogs: Clothes[]) => {
          this.relatedProducts = randomBlogs; // Set the random products as related
        });
      }
    });
  }

  checkStock() {
    if (this.productIsInStock && this.productStock < this.cartQuantity) {
      this.errorMessageStock = true;
      return;
    } else {
      this.errorMessageStock = false;
    }
  }

  addToCart() {
    if (this.cartQuantity > 0) {
      const selectedPrice = this.clothes.prices.find(price =>
        price.productSize === this.selectedSizeInProduct &&
        price.productColor === this.selectedColor
      );

      this.cartService.addToCart({
        productId: this.clothes.id,
        productName: this.clothes.productName,
        quantity: this.cartQuantity,
        price: this.selectedPrice,
        imageUrl: this.selectedImage || '',
        category: ProductViewText.CLOTHES,
        size: this.selectedSizeInProduct,
        color: this.selectedColor,
        maxStockError: false,
        maxStock: selectedPrice.productStock
      });

      this.errorMessageStock = false;
    }
  }

  openLoyalityProgram() {
    this.router.navigate(['product/loyaltyProgram']);
  }

  filterRating(filter: string = ProductViewText.ORDER_BY_LATEST) {
    // store the current sort order
    this.currentSortOrder = filter;

    // make a copy of the original reviews
    let sortedReviews = [...this.originalReviews];

    // sort the reviews based on the current sort order
    switch (filter) {
      case ProductViewText.ORDER_BY_BEST_RATING:
        sortedReviews.sort((a, b) => b.rating - a.rating);
        break;
      case ProductViewText.ORDER_BY_WORST_RATING:
        sortedReviews.sort((a, b) => a.rating - b.rating);
        break;
      case ProductViewText.ORDER_BY_LATEST:
        sortedReviews.sort((a, b) => b.date.toMillis() - a.date.toMillis());
        break;
      case ProductViewText.ORDER_BY_OLDEST:
        sortedReviews.sort((a, b) => a.date.toMillis() - b.date.toMillis());
        break;
    }

    // set the sorted reviews to the display array
    this.displayedReviews = sortedReviews;
  }

  getReviews() {
    this.productService.getReviewsForProduct(this.productId, ProductViewText.CLOTHES).subscribe(reviews => {
      // set the original reviews
      this.originalReviews = reviews;
      // set the display reviews
      this.displayedReviews = [...reviews];
      // calculate the average rating
      this.calculateAverageRating();
      // sort the reviews based on the current sort order
      this.filterRating(this.currentSortOrder);
    })
  }

  calculateAverageRating(): void {
    this.averageRating = 0;
    if (this.displayedReviews.length > 0) {
      this.displayedReviews.forEach(number => {
        this.averageRating += number.rating
      });
      this.averageRating = this.averageRating / this.displayedReviews.length;
      this.averageRating = Math.round(this.averageRating * 100) / 100;
    } else {
      this.averageRating = 1;
    }
  }

  getRatingCount(star: number): number {
    return this.displayedReviews.filter(review => review.rating === star).length;
  }

  getRatingPercentage(star: number): number {
    return (this.getRatingCount(star) / this.displayedReviews.length) * 100;
  }

  async likeReview(review: ProductReeviews) {
    // check if user is logged in
    if (this.userLoggedIn) {
      // make a copy of the review we are going to update
      const updatedReview = { ...review };

      // check if the user already liked the review
      if (!updatedReview.likes.includes(this.currentUserId)) {
        updatedReview.likes.push(this.currentUserId);
      } else {
        // remove the like if the user already liked the review
        updatedReview.likes = updatedReview.likes.filter(id => id !== this.currentUserId);
      }

      // update the review in the database
      await this.db.collection('reviews')
        .doc(ProductViewText.CLOTHES)
        .collection('allReview')
        .doc(review.id)
        .update({ likes: updatedReview.likes });

      // update the display array
      const index = this.displayedReviews.findIndex(r => r.id === review.id);
      // update the original array
      const allIndex = this.originalReviews.findIndex(r => r.id === review.id);

      if (index !== -1) this.displayedReviews[index] = updatedReview;
      if (allIndex !== -1) this.originalReviews[allIndex] = updatedReview;

      // sort the reviews based on the current sort order
      this.filterRating(this.currentSortOrder);
    } else {
      this.userLoggedOutLikeError = true;
      this.userLoggedOutError = false;
    }
  }

  async likeResponse(review: ProductReeviews) {
    if (this.userLoggedIn) {
      // check if the user already liked the response
      if (!review.responseLikes.includes(this.currentUserId)) {
        review.responseLikes.push(this.currentUserId);
      } else {
        // remove the like if the user already liked the response
        review.responseLikes = review.responseLikes.filter(id => id !== this.currentUserId);
      }
      await this.db.collection('reviews').doc(ProductViewText.CLOTHES).collection('allReview').doc(review.id).update({ responseLikes: review.responseLikes });
    } else {
      this.userLoggedOutLikeError = true;
      this.userLoggedOutError = false;
    }
  }

  ngAfterViewChecked(): void {
    if (this.userLoggedOutLikeError && this.errorMessage) {
      this.scrollToErrorMessage();
    }
  }

  scrollToErrorMessage(): void {
    // Scroll to the error message element
    this.errorMessage.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  goToReviews() {
    // Scroll to the reviews section element
    this.reviewsSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  gotoCreateNewRReview() {
    if (!this.userLoggedIn) {
      this.userLoggedOutError = true;
      this.userLoggedOutLikeError = false;
    } else {
      this.userLoggedOutError = false;
      this.dialog.open(ReviewHandleComponent, {
        data: {
          userId: this.userReview.id,
          edit: false,
          productId: this.clothes.id,
          userFirstName: this.userReview.firstName,
          userLastName: this.userReview.lastName,
          pageFrom: ProductViewText.CLOTHES,
          category: ProductViewText.CLOTHES
        }
      });
    }
  }

  editReview(review: ProductReeviews) {
    this.dialog.open(ReviewHandleComponent, {
      data: {
        userId: this.userReview.id,
        edit: true,
        review: review,
        productId: this.clothes.id,
        userFirstName: this.userReview.firstName,
        userLastName: this.userReview.lastName,
        pageFrom: ProductViewText.CLOTHES,
        category: ProductViewText.CLOTHES
      }
    });
  }

  get visibleReviews(): ProductReeviews[] {
    return this.showAllReviews
      ? this.displayedReviews
      : this.displayedReviews.slice(0, this.initialReviewCount);
  }

  toggleReviewsDisplay() {
    this.showAllReviews = !this.showAllReviews;
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }

  back() {
    this.location.back();
  }
}
