import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { DeleteConfirmationDialogComponent } from '../../../../delete-confirmation-dialog/delete-confirmation-dialog.component';
import { DeleteConfirmationText } from '../../../../delete-confirmation-dialog/delete-text';
import { DocumentHandlerService } from '../../../../document.handler.service';
import { SuccessfullDialogComponent } from '../../../../successfull-dialog/successfull-dialog.component';
import { SuccessFullDialogText } from '../../../../successfull-dialog/sucessfull-dialog-text';
import { AdminService } from '../../../admin.service';
import { NutritionalTable } from '../../product-models/nutritional-table.model';
import { OrganicFood } from '../../product-models/organic-food.model';
import { ProductPrice } from '../../product-models/product-price.model';
import { ProductViewText } from '../../product-view-texts';
import { Location } from '@angular/common';
import { AddPriceDialogComponent } from '../add-price-dialog/add-price-dialog.component';
import { Editor, Toolbar } from 'ngx-editor';
import { ProductReeviews } from '../../product-models/product-reviews.model';
import { LoadingService } from '../../../../loading-spinner/loading.service';
import { Timestamp } from 'firebase/firestore';
import { DefaultImageUrl } from '../../../default-image-url';

@Component({
  selector: 'app-handle-organic-food',
  templateUrl: './handle-organic-food.component.html',
  styleUrl: '../../../../../styles/product-management.scss',
  animations: [
    // name of tha animation what can call in html
    trigger('collapseField', [
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
export class HandleOrganicFoodComponent {
  @ViewChild('form') createOrganicFoodForm: NgForm;  // Reference to the form for validation
  @ViewChild('fileInput') fileInput!: ElementRef; // To the upload image button management

  // Form-related properties
  errorMessage: boolean = false;
  productNameExistsError: boolean = false;
  isSafeForConsumptionDuringPregnancy: boolean = true;
  isSafeForConsumptionDuringBreastfeeding: boolean = true;

  selectedUnit: string = '';
  selectedCategory: string = '';

  // Product categories
  productViewText = ProductViewText;
  productCategories: string[] = [
    ProductViewText.CEREALS,
    ProductViewText.HEALTHY_SNACKS,
    ProductViewText.COOKING_iNGREDIENTS,
    ProductViewText.DRINKS
  ];

  // Flavors and Allergens
  availableFlavors: string[] = [
    ProductViewText.UNFLAVORED,
    ProductViewText.VANILLA_FLAVOR,
    ProductViewText.CHOCOLATE_FLAVOR,
    ProductViewText.STRAWBERRY_FLAVOR,
    ProductViewText.PINEAPPLE_MANGO_FLAVOR,
    ProductViewText.COCONUT_FLAVOR,
    ProductViewText.TIRAMISU_FLAVOR,
    ProductViewText.COOKIES_AND_CREAM_FLAVOR,
    ProductViewText.PEANUT_BUTTER_FLAVOR,
    ProductViewText.WHITE_CHOCOLATE_FLAVOR,
    ProductViewText.PISTACHIO_FLAVOR,
    ProductViewText.CHOCOLATE_TOFFEE_FLAVOR,
    ProductViewText.BANANA_FLAVOR,
    ProductViewText.COFFEE_FLAVOR,
    ProductViewText.SALT_CARAMEL_FLAVOR,
    ProductViewText.MINT_CHOCOLATE_FLAVOR,
    ProductViewText.MOCHA_FLAVOR,
    ProductViewText.CINNAMON_ROLL_FLAVOR,
    ProductViewText.BLUEBERRY_FLAVOR,
    ProductViewText.PUMPKIN_SPICE_FLAVOR,
    ProductViewText.CHOCOLATE_PEANUT_BUTTER_FLAVOR,
    ProductViewText.APPLE_PIE_FLAVOR,
    ProductViewText.LEMON_CHEESECAKE_FLAVOR,
    ProductViewText.BLACK_BISCUIT_FLAVOR,
    ProductViewText.CAPPUCINO
  ];
  selectedFlavors: string[] = [];

  availableAllergens: string[] = [
    ProductViewText.LACTOSE_FREE_ALLERGEN,
    ProductViewText.GLUTEN_FREE_ALLERGEN,
    ProductViewText.SOY_FREE_ALLERGEN,
    ProductViewText.EGG_FREE_ALLERGEN,
    ProductViewText.SUGAR_FREE_ALLERGEN,
    ProductViewText.PEANUTS_FREE_ALLERGEN,
    ProductViewText.FISH_FREE_ALLERGEN
  ];
  selectedAllergenes: string[] = [];

  // Prices
  productPrices: ProductPrice[] = [];
  missingPricesErrorMessage: boolean = false;

  // Nutritional table
  nutritionalTable: NutritionalTable = {
    nutritionalValueEnergyKj: null,
    nutritionalValueEnergyCal: null,
    nutritionalValueFats: null,
    nutritionalValueFattyAcids: null,
    nutritionalValueCarbohydrates: null,
    nutritionalValueSugar: null,
    nutritionalValueProteins: null,
    nutritionalValueSalt: null,
  };

  // Organic food object to handle the product
  organicFoodObject: OrganicFood;

  // create or modify an existing product
  isProductEdit: boolean = false;
  organicFoodId: string = '';

  // use unified image to the product
  isUnifiedImage: boolean = false;
  unifiedImageUrl: string = null;

  // text editor
  editor: Editor;
  toolbar: Toolbar;

  // small description length
  smallDescriptionLength: number = 0;

  description: string = "";

  // date added
  dateAdded: Timestamp;

  // responsibility
  isLargeScreen: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private storage: AngularFireStorage,
    private db: AngularFirestore,
    private location: Location,
    public dialog: MatDialog,
    private documentumHandler: DocumentHandlerService,
    private adminService: AdminService,
    public loadingService: LoadingService
  ) { }

  ngOnInit(): void {
    this.checkScreenSize();
    this.editor = new Editor();

    // Set up toolbar with command keys
    this.toolbar = [
      ['bold', "italic", "underline", "strike"],
      ["blockquote", "horizontal_rule"],
      ["ordered_list", "bullet_list"],
      [{ heading: ["h1", "h2", "h3", "h4", "h5", "h6"] }],
      ["link"],
      ["align_left", "align_center", "align_right", "align_justify", "indent", "outdent"],
      ["undo", "redo"]
    ];


    this.organicFoodObject = {
      id: "",
      productName: "",
      productCategory: "",
      smallDescription: "",
      ingredients: "",
      description: "",
      dosageUnit: "",
      flavors: [],

      useUnifiedImage: this.isUnifiedImage,

      safeForConsumptionDuringBreastfeeding: true,
      safeForConsumptionDuringPregnancy: true,

      nutritionalTable: null,

      // date added
      dateAdded: Timestamp.now(),

      allergens: [],

      prices: [],
    }
    this.route.params.subscribe(params => {
      // get the organic food product by id
      this.documentumHandler.getInnerDocumentByID("products", ProductViewText.ORGANIC_FOOD, "allProduct", params['productId']).subscribe((organicProduct: OrganicFood) => {
        // make a copy from the object
        this.organicFoodObject = { ...organicProduct };

        // if it's not undefinied (so the user want to edit a specified product not create a new)
        if (this.organicFoodObject.productName !== undefined) {
          this.organicFoodId = this.organicFoodObject.id;
          this.isProductEdit = true;
          // pass the value to the object
          this.selectedCategory = this.organicFoodObject.productCategory;

          this.selectedUnit = this.organicFoodObject.dosageUnit;

          // prices
          this.productPrices = this.organicFoodObject.prices;
          this.isUnifiedImage = this.organicFoodObject.useUnifiedImage;
          if (this.isUnifiedImage) {
            this.unifiedImageUrl = this.organicFoodObject.prices[0].productImage;
          }
          this.sortPrices();

          // flavor and allergies list
          this.selectedFlavors = this.organicFoodObject.flavors;
          this.selectedAllergenes = this.organicFoodObject.allergens;

          // date added
          this.dateAdded = this.organicFoodObject.dateAdded;

          // safety
          this.isSafeForConsumptionDuringBreastfeeding = this.organicFoodObject.safeForConsumptionDuringBreastfeeding;
          this.isSafeForConsumptionDuringPregnancy = this.organicFoodObject.safeForConsumptionDuringPregnancy;

          // nutritional table
          this.nutritionalTable = this.organicFoodObject.nutritionalTable;

          this.smallDescriptionLength = this.organicFoodObject.smallDescription.length;
          this.description = this.organicFoodObject.description;
        }
      });
    });
    this.sortItems();
  }

  @HostListener('window:resize', [])
  onResize(): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    this.isLargeScreen = window.innerWidth > 770;
  }

  // Sort product categories, genders, flavors, proteins and allergies
  sortItems(): void {
    // categories
    this.productCategories.sort((a, b) => a.localeCompare(b));

    // Flavors
    this.availableFlavors.sort((a, b) => a.localeCompare(b));

    // Allergens
    this.availableAllergens.sort((a, b) => a.localeCompare(b));
  }

  // Update UI based on selected category
  isCategorySelected() {
    if (this.selectedCategory === ProductViewText.DRINKS) {
      this.selectedUnit = ProductViewText.ML;
    } else {
      this.selectedUnit = ProductViewText.GRAM;
    }
  }

  // Handle selection of allergens
  selectionOfTheList(type: string, item: string): void {
    switch (type) {
      case ProductViewText.FLAVORS:
        this.toggleSelection(this.selectedFlavors, item);
        break;
      case ProductViewText.ALLERGENES:
        this.toggleSelection(this.selectedAllergenes, item);
        break;
    }
  }

  // Helper function to toggle item selection in an array
  toggleSelection(list: string[], item: string): void {
    const index = list.indexOf(item);

    // remove item from the list if it's selected othervise add to the list
    index > -1 ? list.splice(index, 1) : list.push(item);
  }

  // Remove selected item
  removeItemFromTheList(type: string, item: string): void {
    if (type === ProductViewText.FLAVORS) {
      this.removeItem(this.selectedFlavors, item);
    }
    if (type === ProductViewText.ALLERGENES) {
      this.removeItem(this.selectedAllergenes, item);
    }
  }

  // Helper function to remove item from array
  removeItem(list: string[], item: string): void {
    const index = list.indexOf(item);
    if (index > -1) list.splice(index, 1);
  }

  // handle upload image button
  triggerImageUpload() {
    this.fileInput.nativeElement.click();
  }

  // handle unified checkbox value
  onUnifiedImageChange(isUnified: boolean) {
    if (isUnified) {
      this.unifiedImageUrl = DefaultImageUrl.productUrl;
      this.productPrices.forEach(price => {
        price.productImage = this.unifiedImageUrl
      });
    } else {
      this.unifiedImageUrl = null;
    }
  }

  // Handle file selection and convert to Base64
  onFileSelected(event: any) {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.unifiedImageUrl = reader.result as string; // Base64 string
        this.productPrices.forEach(price => {
          price.productImage = this.unifiedImageUrl
        });
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.unifiedImageUrl = DefaultImageUrl.productUrl;
    this.productPrices.forEach(price => {
      price.productImage = this.unifiedImageUrl
    });
  }

  // Open dialog to add new price
  addNewPrice() {
    this.missingPricesErrorMessage = false;
    const dialogRef = this.dialog.open(AddPriceDialogComponent, {
      data: {
        unit: this.selectedUnit,
        allPrices: this.productPrices,
        editText: false,
        allFlavors: this.selectedFlavors,
        productCategory: ProductViewText.ORGANIC_FOOD,
        productInnerCategory: this.selectedCategory,
        useUnifiedImage: this.unifiedImageUrl,
      }
    });

    dialogRef.afterClosed().subscribe((newPrice: ProductPrice) => {
      if (newPrice) {
        // Ensure product image is not null
        if (newPrice.productImage === null || newPrice.productImage === undefined || newPrice.productImage === '') {
          newPrice.productImage = DefaultImageUrl.productUrl;
        }

        // if new price is the default then change the old default value to false
        if (newPrice.setAsDefaultPrice) {
          this.productPrices.forEach(price => {
            if (price.setAsDefaultPrice) {
              price.setAsDefaultPrice = false;
            }
          })
        }

        // Check for duplicates before adding
        const existingIndex = this.productPrices.findIndex(price =>
          price.productFlavor === newPrice.productFlavor &&
          price.quantityInProduct === newPrice.quantityInProduct
        );

        if (existingIndex !== -1) {
          // If a duplicate exists, update it instead of pushing a new price
          this.productPrices[existingIndex] = newPrice;
        } else {
          // If no duplicates, add the new price
          this.productPrices.push(newPrice);
        }

        this.sortPrices();
      }
    });
  }

  // Open dialog to edit price
  editPrice(id: number) {
    const dialogRef = this.dialog.open(AddPriceDialogComponent, {
      data: {
        unit: this.selectedUnit,
        allPrices: this.productPrices,
        allFlavors: this.selectedFlavors,
        selectedFlavor: this.productPrices[id].productFlavor,
        selectedPrice: this.productPrices[id],
        editText: true,
        productCategory: ProductViewText.ORGANIC_FOOD,
        productInnerCategory: this.selectedCategory,
        useUnifiedImage: this.unifiedImageUrl,
      }
    });

    dialogRef.afterClosed().subscribe((editedPrice: ProductPrice | boolean) => {
      if (editedPrice === true) {
        // If true is returned, delete the price
        this.deletePrice(id);
      } else if (editedPrice && typeof editedPrice === 'object') {
        // If an edited price is returned, update the productPrices array
        // Ensure product image is not null
        if (editedPrice.productImage === null || editedPrice.productImage === undefined || editedPrice.productImage === '') {
          editedPrice.productImage = DefaultImageUrl.productUrl;
        }

        // if edited price is the default then change the old default value to false
        if (editedPrice.setAsDefaultPrice) {
          this.productPrices.forEach(price => {
            if (price.setAsDefaultPrice) {
              price.setAsDefaultPrice = false;
            }
          })
        }

        // Check if a price with the same color and size already exists
        const existingIndex = this.productPrices.findIndex(price =>
          price.productFlavor === editedPrice.productFlavor &&
          price.quantityInProduct === editedPrice.quantityInProduct
        );

        if (existingIndex !== -1 && existingIndex !== id) {
          // Update the existing entry and remove duplicates
          this.productPrices[existingIndex] = editedPrice;
          this.productPrices = this.productPrices.filter((price, index) =>
            !(price.productFlavor === editedPrice.productFlavor &&
              price.quantityInProduct === editedPrice.quantityInProduct && index !== existingIndex)
          );
        } else {
          // If no duplicate, update the price at the specified id
          this.productPrices[id] = editedPrice;
        }

        this.sortPrices();
      }
    });
  }

  deletePrice(id: number) {
    this.productPrices.splice(id, 1);
    this.sortPrices();
  }

  sortPrices() {
    this.productPrices = this.productPrices.sort((a, b) => {
      const priceA = this.getEffectivePrice(a);
      const priceB = this.getEffectivePrice(b);
      return priceA - priceB;
    });
  }

  // Helper method to get the effective price (product price or discounted price)
  private getEffectivePrice(price: ProductPrice): number {
    return price.discountedPrice > 0 ? price.discountedPrice : price.productPrice;
  }

  async addNewOrganicFood() {
    await this.loadingService.withLoading(async () => {
      // error handling
      if (this.productPrices.length === 0) {
        this.missingPricesErrorMessage = true;
      } else {
        this.missingPricesErrorMessage = false;
      }

      const checkForDuplication = await this.documentumHandler.checkForDuplicationInnerCollection(
        "products", ProductViewText.ORGANIC_FOOD, "allProduct", "productName", this.documentumHandler.makeUpperCaseEveryWordFirstLetter(this.createOrganicFoodForm.value.productName), undefined, ""
      );

      if (checkForDuplication) {
        this.productNameExistsError = true;

        return;
      }

      if (this.nutritionalTable.nutritionalValueEnergyCal === null) {
        this.nutritionalTable = {
          nutritionalValueEnergyKj: 0,
          nutritionalValueEnergyCal: 0,
          nutritionalValueFats: 0,
          nutritionalValueFattyAcids: 0,
          nutritionalValueCarbohydrates: 0,
          nutritionalValueSugar: 0,
          nutritionalValueProteins: 0,
          nutritionalValueSalt: 0
        }
      }

      const hasDefaultPrice = this.productPrices.some(priceObj => priceObj.setAsDefaultPrice);

      if (!hasDefaultPrice) {
        this.productPrices[0].setAsDefaultPrice = true;
      }

      if (this.selectedCategory === ProductViewText.DRINKS || this.selectedCategory === ProductViewText.HEALTHY_SNACKS) {
        if (this.selectedFlavors.length === 0) {
          this.selectedFlavors.push(ProductViewText.UNFLAVORED);
        }
      }

      // create new Organic food object
      this.organicFoodObject = {
        id: "",
        productName: this.documentumHandler.makeUpperCaseEveryWordFirstLetter(this.createOrganicFoodForm.value.productName),
        productCategory: this.selectedCategory,
        smallDescription: this.createOrganicFoodForm.value.smallDescription,
        ingredients: this.createOrganicFoodForm.value.ingredients,
        description: this.description,
        dosageUnit: this.selectedUnit,
        flavors: this.selectedFlavors,

        safeForConsumptionDuringBreastfeeding: this.isSafeForConsumptionDuringBreastfeeding,
        safeForConsumptionDuringPregnancy: this.isSafeForConsumptionDuringPregnancy,

        nutritionalTable: this.nutritionalTable,

        allergens: this.selectedAllergenes,

        // date added
        dateAdded: Timestamp.now(),

        prices: [],
        useUnifiedImage: this.isUnifiedImage,
      }

      // Add the new Organic food
      try {
        const documentumRef = await this.db.collection("products").doc(ProductViewText.ORGANIC_FOOD).collection("allProduct").add(this.organicFoodObject);
        // id the document created then save the document id in the field
        await documentumRef.update({ id: documentumRef.id });
        this.productPrices = await this.adminService.uploadImagesAndSaveProduct(ProductViewText.ORGANIC_FOOD, documentumRef.id, this.unifiedImageUrl, this.productPrices);
        await documentumRef.update({ prices: this.productPrices });
        this.errorMessage = false;
        this.productNameExistsError = false;
        this.missingPricesErrorMessage = false;
        // if everything was succes then open successfull dialog
        this.dialog.open(SuccessfullDialogComponent, {
          data: {
            text: SuccessFullDialogText.CREATED_TEXT,
            needToGoPrevoiusPage: true
          }
        });
      } catch (error) {
        this.errorMessage = true;
      }
    });
  }

  async editOrganicFood() {
    await this.loadingService.withLoading(async () => {
      // error handling
      if (this.productPrices.length === 0) {
        this.missingPricesErrorMessage = true;
      } else {
        this.missingPricesErrorMessage = false;
      }

      const checkForDuplication = await this.documentumHandler.checkForDuplicationInnerCollection(
        "products", ProductViewText.ORGANIC_FOOD, "allProduct", "productName", this.documentumHandler.makeUpperCaseEveryWordFirstLetter(this.createOrganicFoodForm.value.productName), undefined, this.organicFoodObject.id
      );

      if (checkForDuplication) {
        this.productNameExistsError = true;

        return;
      }

      if (this.nutritionalTable.nutritionalValueEnergyCal === null) {
        this.nutritionalTable = {
          nutritionalValueEnergyKj: 0,
          nutritionalValueEnergyCal: 0,
          nutritionalValueFats: 0,
          nutritionalValueFattyAcids: 0,
          nutritionalValueCarbohydrates: 0,
          nutritionalValueSugar: 0,
          nutritionalValueProteins: 0,
          nutritionalValueSalt: 0
        }
      }

      const hasDefaultPrice = this.productPrices.some(priceObj => priceObj.setAsDefaultPrice);

      if (!hasDefaultPrice) {
        this.productPrices[0].setAsDefaultPrice = true;
      }

      if (this.selectedCategory === ProductViewText.DRINKS || this.selectedCategory === ProductViewText.HEALTHY_SNACKS) {
        if (this.selectedFlavors.length === 0) {
          this.selectedFlavors.push(ProductViewText.UNFLAVORED);
        }
      }

      this.productPrices = await this.adminService.uploadImagesAndSaveProduct(ProductViewText.ORGANIC_FOOD, this.organicFoodId, this.unifiedImageUrl, this.productPrices);

      // create new Food supliment object
      this.organicFoodObject = {
        id: this.organicFoodId,
        productName: this.documentumHandler.makeUpperCaseEveryWordFirstLetter(this.createOrganicFoodForm.value.productName),
        productCategory: this.selectedCategory,
        smallDescription: this.createOrganicFoodForm.value.smallDescription,
        ingredients: this.createOrganicFoodForm.value.ingredients,
        description: this.description,
        dosageUnit: this.selectedUnit,
        flavors: this.selectedFlavors,

        safeForConsumptionDuringBreastfeeding: this.isSafeForConsumptionDuringBreastfeeding,
        safeForConsumptionDuringPregnancy: this.isSafeForConsumptionDuringPregnancy,

        nutritionalTable: this.nutritionalTable,

        allergens: this.selectedAllergenes,

        // date added
        dateAdded: this.organicFoodObject.dateAdded,

        prices: this.productPrices,
        useUnifiedImage: this.isUnifiedImage,
      }

      // Edit the organic food
      try {
        await this.db.collection("products").doc(ProductViewText.ORGANIC_FOOD).collection("allProduct").doc(this.organicFoodId).update(this.organicFoodObject);

        this.errorMessage = false;
        this.productNameExistsError = false;
        this.missingPricesErrorMessage = false;

        // if everything was succes then open successfull dialog
        this.dialog.open(SuccessfullDialogComponent, {
          data: {
            text: SuccessFullDialogText.MODIFIED_TEXT,
            needToGoPrevoiusPage: true
          }
        });
      } catch (error) {
        this.errorMessage = true;
      }
    });
  }

  async deleteOrganicFood() {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      data: {
        text: DeleteConfirmationText.PRODUCT_DELETE
      }
    });

    const confirmToDeleteAddress = await dialogRef.afterClosed().toPromise();

    if (confirmToDeleteAddress) {
      await this.loadingService.withLoading(async () => {
        try {
          // Delete images from Firebase Storage
          const deleteImagePromises = this.productPrices.map(async (price: ProductPrice) => {
            if (price.productImage && price.productImage !== DefaultImageUrl.productUrl) {
              try {
                const fileRef = this.storage.refFromURL(price.productImage);
                await fileRef.delete().toPromise();
              } catch (error) { }
            }
          });

          // Await all delete promises
          await Promise.all(deleteImagePromises);

          // Delete all the images from the product storage folder
          await this.adminService.deleteAllFilesInFolder(ProductViewText.ORGANIC_FOOD, this.organicFoodId);

          // Delete the product from firestore
          const deleteAddressRef = this.db.collection("products").doc(ProductViewText.ORGANIC_FOOD).collection("allProduct").doc(this.organicFoodId);
          await deleteAddressRef.delete();
          this.dialog.open(SuccessfullDialogComponent, {
            data: {
              text: SuccessFullDialogText.DELETED_TEXT,
              needToGoPrevoiusPage: true
            }
          });
        } catch (error) { }
      });
    }
  }

  back() {
    this.location.back();
  }
}
