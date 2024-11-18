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
import { User } from '../../../user/user.model';
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
    ]),
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
  averageRating: number = 0;
  reviews: ProductReeviews[] = [];
  userLoggedIn: boolean = false;
  userReview: User;
  currentUserId: string = '';
  userLoggedOutError: boolean = false;
  userLoggedOutLikeError: boolean = false;
  productId: string = '';
  isProductInCart: boolean = false;

  //filter reviews
  selectedReviewFilter: string = ProductViewText.ORDER_BY_LATEST;
  availableReviewFilters: string[] = [
    ProductViewText.ORDER_BY_OLDEST,
    ProductViewText.ORDER_BY_LATEST,
    ProductViewText.ORDER_BY_WORST_RATING,
    ProductViewText.ORDER_BY_BEST_RATING
  ];

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

  filterRating() {
    if (this.selectedReviewFilter === ProductViewText.ORDER_BY_BEST_RATING) {
      this.reviews = this.productService.sortReviewsByRatingASC(this.reviews);
    } else if (this.selectedReviewFilter === ProductViewText.ORDER_BY_WORST_RATING) {
      this.reviews = this.productService.sortReviewsByRatingDESC(this.reviews);
    } else if (this.selectedReviewFilter === ProductViewText.ORDER_BY_LATEST) {
      this.reviews = this.productService.sortReviewsByNewest(this.reviews);
    } else if (this.selectedReviewFilter === ProductViewText.ORDER_BY_OLDEST) {
      this.reviews = this.productService.sortReviewsByOldest(this.reviews);
    }
  }

  getReviews() {
    this.productService.getReviewsForProduct(this.productId, ProductViewText.CLOTHES).subscribe(reviews => {
      this.reviews = reviews;
      this.calculateAverageRating();
      this.filterRating();
    })
  }

  calculateAverageRating(): void {
    this.averageRating = 0;
    if (this.reviews.length > 0) {
      this.reviews.forEach(number => {
        this.averageRating += number.rating
      });
      this.averageRating = this.averageRating / this.reviews.length;
      this.averageRating = Math.round(this.averageRating * 100) / 100;
    } else {
      this.averageRating = 1;
    }
  }

  getRatingCount(star: number): number {
    return this.reviews.filter(review => review.rating === star).length;
  }

  getRatingPercentage(star: number): number {
    return (this.getRatingCount(star) / this.reviews.length) * 100;
  }

  async likeReview(review: ProductReeviews) {
    if (this.userLoggedIn) {
      // Check if user already liked the review
      if (!review.likes.includes(this.currentUserId)) {
        review.likes.push(this.currentUserId);
      } else {
        // Remove the like if user clicks again
        review.likes = review.likes.filter(id => id !== this.currentUserId);
      }
      await this.db.collection('reviews').doc(ProductViewText.CLOTHES).collection('allReview').doc(review.id).update({ likes: review.likes });
    } else {
      this.userLoggedOutLikeError = true;
      this.userLoggedOutError = false;
    }
  }

  async likeResponse(review: ProductReeviews) {
    if (this.userLoggedIn) {
      // Check if user already liked the response
      if (!review.responseLikes.includes(this.currentUserId)) {
        review.responseLikes.push(this.currentUserId);
      } else {
        // Remove the like if user clicks again
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

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }

  back() {
    this.location.back();
  }
}
