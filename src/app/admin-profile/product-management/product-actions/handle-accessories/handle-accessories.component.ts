import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, ElementRef, ViewChild } from '@angular/core';
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
import { ProductPrice } from '../../product-models/product-price.model';
import { ProductViewText } from '../../product-view-texts';
import { AddColorDialogComponent } from '../add-color-dialog/add-color-dialog.component';
import { AddPriceDialogComponent } from '../add-price-dialog/add-price-dialog.component';
import { Location } from '@angular/common';
import { ProductColor } from '../../product-models/product-color.model';
import { Accessories } from '../../product-models/accessories.model';
import { ProductReeviews } from '../../product-models/product-reviews.model';
import { Editor, Toolbar } from 'ngx-editor';

@Component({
  selector: 'app-handle-accessories',
  templateUrl: './handle-accessories.component.html',
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
export class HandleAccessoriesComponent {
  @ViewChild('form') createAccessoriesForm: NgForm;  // Reference to the form for validation
  @ViewChild('fileInput') fileInput!: ElementRef; // To the upload image button management

  // Form-related properties
  errorMessage: boolean = false;
  productNameExistsError: boolean = false;

  selectedCategory: string = ProductViewText.SHAKERS_AND_SPORTS_EQUIPMENTS;

  // Product categories
  productViewText = ProductViewText;

  // accessories type
  availableAccessoriesTypes: string[] = [
    ProductViewText.SHAKERS,
    ProductViewText.WEIGHT_LIFTING
  ];
  selectedAccessoryType: string = '';

  // Colors
  accessoryColors: ProductColor[] = [];

  // Prices
  productPrices: ProductPrice[] = [];
  missingPricesErrorMessage: boolean = false;

  // Food suppliment object to handle the product
  accessoryObject: Accessories;

  // create or modify an existing product
  isProductEdit: boolean = false;
  accessoryId: string = '';

  // use unified image to the product
  isUnifiedImage: boolean = false;
  unifiedImageUrl: string = null;

  // text editor
  editor: Editor;
  toolbar: Toolbar;

  // small description length
  smallDescriptionLength: number = 0;

  description: string = "";


  constructor(private route: ActivatedRoute, private storage: AngularFireStorage, private db: AngularFirestore, private location: Location, public dialog: MatDialog, private documentumHandler: DocumentHandlerService, private adminService: AdminService) { }

  ngOnInit(): void {
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

    this.accessoryObject = {
      id: "",
      productName: "",
      productCategory: this.selectedCategory,
      description: "",
      smallDescription: "",
      useUnifiedImage: this.isUnifiedImage,

      equipmentType: "",

      prices: []
    }
    this.route.params.subscribe(params => {
      // get the food supliment product by id
      this.documentumHandler.getInnerDocumentByID("products", ProductViewText.ACCESSORIES, "allProduct", params['productId']).subscribe((accessories: Accessories) => {
        // make a copy from the object
        this.accessoryObject = { ...accessories };

        // if it's not undefinied (so the user want to edit a specified product not create a new)
        if (this.accessoryObject.productName !== undefined) {
          this.accessoryId = this.accessoryObject.id;
          this.isProductEdit = true;
          // pass the value to the object
          this.selectedCategory = this.accessoryObject.productCategory;

          // type, material
          this.selectedAccessoryType = this.accessoryObject.equipmentType;

          // price, color, size
          this.productPrices = this.accessoryObject.prices;

          this.smallDescriptionLength = this.accessoryObject.smallDescription.length;
          this.description = this.accessoryObject.description;

          this.isUnifiedImage = this.accessoryObject.useUnifiedImage;
          if (this.isUnifiedImage) {
            this.unifiedImageUrl = this.accessoryObject.prices[0].productImage;
          }

          // update the clothing colors array
          this.updateColorsFromPrices();
        }
      });
    });
    this.sortItems();
  }

  updateColorsFromPrices() {
    const uniqueColors: { [key: string]: string } = {}; // To track unique colors

    this.productPrices.forEach(price => {
      // Check if the color is already in the uniqueColors object
      if (!uniqueColors[price.productColor]) {
        // If it's not, add it to uniqueColors
        uniqueColors[price.productColor] = price.productImage; // Assuming productImage is available

        // Check if the color already exists in the accessoryColors array
        const existingColorIndex = this.accessoryColors.findIndex(color => color.color === price.productColor);
        if (existingColorIndex === -1) {
          // If not found, push the unique color and its imageUrl to the accessoryColors array
          this.accessoryColors.push({
            color: price.productColor,
            imageUrl: price.productImage || '' // Use an empty string if no image
          });
        }
      }
    });
  }

  // Sort product categories, genders, flavors, proteins and allergies
  sortItems(): void {

    // Accessory types
    this.availableAccessoriesTypes.sort((a, b) => a.localeCompare(b));
  }

  isTypeSelected() {
    this.productPrices = [];
    this.accessoryColors = [];
  }

  // Open dialog to add new color
  addNewColor() {
    this.missingPricesErrorMessage = false;
    const dialogRef = this.dialog.open(AddColorDialogComponent, {
      data: {
        allColors: this.accessoryColors,
        editText: false,
        productCategory: ProductViewText.CLOTHES
      }
    });

    dialogRef.afterClosed().subscribe((newColor: ProductColor) => {
      if (newColor) {
        // Ensure color product image is not null
        if (newColor.imageUrl === null || newColor.imageUrl === undefined) {
          newColor.imageUrl = "";
        }

        // Check if the color already exists in the array
        const existingColor = this.accessoryColors.find(color => color.color === newColor.color);

        if (existingColor) {
          existingColor.imageUrl = newColor.imageUrl;
        } else {
          this.accessoryColors.push(newColor);
        }
        this.sortColors();
      }
    });
  }

  // Open dialog to edit color
  editColor(id: number) {
    const dialogRef = this.dialog.open(AddColorDialogComponent, {
      data: {
        allColors: this.accessoryColors,
        selectedColor: this.accessoryColors[id],
        editText: true,
        productCategory: ProductViewText.CLOTHES
      }
    });

    dialogRef.afterClosed().subscribe((editedColor: ProductColor | boolean) => {
      if (editedColor === true) {
        // If true is returned, delete the color
        this.deleteColor(id);
      } else if (editedColor && typeof editedColor === 'object') {
        // If an edited color is returned, update the accessoryColors array
        // Ensure product image is not null
        if (editedColor.imageUrl === null || editedColor.imageUrl === undefined) {
          editedColor.imageUrl = "";
        }

        // Check if the color already exists in the array
        const existingIndex = this.accessoryColors.findIndex(color => color.color === editedColor.color);

        if (existingIndex !== -1 && existingIndex !== id) {
          // If a duplicate exists, update its imageUrl and remove duplicates
          this.accessoryColors[existingIndex].imageUrl = editedColor.imageUrl;
          this.accessoryColors = this.accessoryColors.filter((color, index) =>
            color.color !== editedColor.color || index === existingIndex
          );
        } else {
          // If no duplicate, update the existing color at the specified id
          this.accessoryColors[id] = editedColor;
        }

        // Update corresponding productPrices for all entries that have the same color
        this.productPrices.forEach(price => {
          if (price.productColor === editedColor.color) {
            // Update the color and imageUrl as needed
            price.productColor = editedColor.color; // This is probably redundant
            price.productImage = editedColor.imageUrl; // Update to new image URL
          }
        });

        // Sort colors if needed
        this.sortColors();
      }
    });
  }

  deleteColor(id: number) {
    // Remove all prices associated with the deleted color
    this.productPrices = this.productPrices.filter(price => price.productColor !== this.accessoryColors[id].color);
    this.accessoryColors.splice(id, 1);
    this.sortColors();
  }

  sortColors() {
    this.accessoryColors = this.accessoryColors.sort((a, b) => a.color.localeCompare(b.color));
  }

  // handle upload image button
  triggerImageUpload() {
    this.fileInput.nativeElement.click();
  }

  // handle unified checkbox value
  onUnifiedImageChange(isUnified: boolean) {
    if (isUnified) {
      this.unifiedImageUrl = '';
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
    this.unifiedImageUrl = '';
    this.productPrices.forEach(price => {
      price.productImage = this.unifiedImageUrl
    });
  }

  // Open dialog to add new price
  addNewPrice() {
    this.missingPricesErrorMessage = false;
    const dialogRef = this.dialog.open(AddPriceDialogComponent, {
      data: {
        unit: '',
        allColors: this.accessoryColors,
        allPrices: this.productPrices,
        editText: false,
        useUnifiedImage: this.unifiedImageUrl,
        productCategory: ProductViewText.ACCESSORIES,
        accessoriesType: this.selectedAccessoryType
      }
    });

    dialogRef.afterClosed().subscribe((newPrice: ProductPrice) => {
      if (newPrice) {
        // Ensure product image is not null
        if (newPrice.productImage === null || newPrice.productImage === undefined) {
          newPrice.productImage = "";
        }

        // if new price is the default then change the old default value to false
        if (newPrice.setAsDefaultPrice) {
          this.productPrices.forEach(price => {
            if (price.setAsDefaultPrice) {
              price.setAsDefaultPrice = false;
            }
          })
        }

        // Determine the property name based on accessory type
        const sizeProperty = 'productSize';
        const imageUrlProperty = this.selectedAccessoryType === this.productViewText.SHAKERS ? 'productColor' : 'productImage';

        // Check for duplicates before adding
        const existingIndex = this.productPrices.findIndex(price =>
          price[imageUrlProperty] === newPrice[imageUrlProperty] &&
          price[sizeProperty] === newPrice[sizeProperty]
        );

        if (existingIndex !== -1) {
          // If a duplicate exists, update it instead of pushing a new price
          this.productPrices[existingIndex] = newPrice;
        } else {
          // If no duplicates, add the new price
          this.productPrices.push(newPrice);
        }

        // Sort the prices if needed
        this.sortPrices();
      }
    });
  }

  // Open dialog to edit price
  editPrice(id: number) {
    const dialogRef = this.dialog.open(AddPriceDialogComponent, {
      data: {
        unit: '',
        allColors: this.accessoryColors,
        allPrices: this.productPrices,
        size: this.productPrices[id].productSize,
        selectedColor: this.productPrices[id].productColor,
        selectedPrice: this.productPrices[id],
        editText: true,
        useUnifiedImage: this.unifiedImageUrl,
        productCategory: ProductViewText.ACCESSORIES,
        accessoriesType: this.selectedAccessoryType
      }
    });

    dialogRef.afterClosed().subscribe((editedPrice: ProductPrice | boolean) => {
      if (editedPrice === true) {
        // If true is returned, delete the price
        this.deletePrice(id);
      } else if (editedPrice && typeof editedPrice === 'object') {
        // If an edited price is returned, update the productPrices array
        // Ensure product image is not null
        if (editedPrice.productImage === null || editedPrice.productImage === undefined) {
          editedPrice.productImage = "";
        }

        // if edited price is the default then change the old default value to false
        if (editedPrice.setAsDefaultPrice) {
          this.productPrices.forEach(price => {
            if (price.setAsDefaultPrice) {
              price.setAsDefaultPrice = false;
            }
          })
        }

        // Determine the property name based on accessory type
        const sizeProperty = 'productSize';
        const imageUrlProperty = this.selectedAccessoryType === this.productViewText.SHAKERS ? 'productColor' : 'productImage';

        // Check if a price with the same color and size already exists
        const existingIndex = this.productPrices.findIndex(price =>
          price[imageUrlProperty] === editedPrice[imageUrlProperty] &&
          price[sizeProperty] === editedPrice[sizeProperty]
        );

        if (existingIndex !== -1 && existingIndex !== id) {
          // Update the existing entry and remove duplicates
          this.productPrices[existingIndex] = editedPrice;
          this.productPrices = this.productPrices.filter((price, index) =>
            !(price[imageUrlProperty] === editedPrice[imageUrlProperty] &&
              price[sizeProperty] === editedPrice[sizeProperty] && index !== existingIndex)
          );
        } else {
          // If no duplicate, update the price at the specified id
          this.productPrices[id] = editedPrice;
        }

        // Sort the prices if needed
        this.sortPrices();
      }
    });
  }

  deletePrice(id: number) {
    this.productPrices.splice(id, 1);
    this.sortPrices();
  }

  sortPrices() {
    this.productPrices = this.productPrices.sort((a, b) => a.productPrice - b.productPrice);
  }

  async addNewAccessory() {
    // error handleing
    if (this.productPrices.length === 0) {
      this.missingPricesErrorMessage = true;
    } else {
      this.missingPricesErrorMessage = false;
    }

    const checkForDuplication = await this.documentumHandler.checkForDuplicationInnerCollection(
      "products", ProductViewText.ACCESSORIES, "allProduct", "productName", this.documentumHandler.makeUpperCaseEveryWordFirstLetter(this.createAccessoriesForm.value.productName), undefined, ""
    );

    if (checkForDuplication) {
      this.productNameExistsError = true;

      return;
    }

    const hasDefaultPrice = this.productPrices.some(priceObj => priceObj.setAsDefaultPrice);

    if (!hasDefaultPrice) {
      this.productPrices[0].setAsDefaultPrice = true;
    }

    // create new Accessory object
    this.accessoryObject = {
      id: "",
      productName: this.documentumHandler.makeUpperCaseEveryWordFirstLetter(this.createAccessoriesForm.value.productName),
      productCategory: this.selectedCategory,
      description: this.createAccessoriesForm.value.description,
      smallDescription: this.createAccessoriesForm.value.smallDescription,
      useUnifiedImage: this.isUnifiedImage,

      equipmentType: this.selectedAccessoryType,

      prices: []
    }

    // Add the new accessory
    try {
      const documentumRef = await this.db.collection("products").doc(ProductViewText.ACCESSORIES).collection("allProduct").add(this.accessoryObject);
      // id the document created then save the document id in the field
      await documentumRef.update({ id: documentumRef.id });
      this.productPrices = await this.adminService.uploadImagesAndSaveProduct(ProductViewText.ACCESSORIES, documentumRef.id, this.unifiedImageUrl, this.productPrices, this.selectedAccessoryType);
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
  }

  async editAccessory() {
    // error handleing
    if (this.productPrices.length === 0) {
      this.missingPricesErrorMessage = true;
    } else {
      this.missingPricesErrorMessage = false;
    }

    const checkForDuplication = await this.documentumHandler.checkForDuplicationInnerCollection(
      "products", ProductViewText.ACCESSORIES, "allProduct", "productName", this.documentumHandler.makeUpperCaseEveryWordFirstLetter(this.createAccessoriesForm.value.productName), undefined, this.accessoryObject.id
    );

    if (checkForDuplication) {
      this.productNameExistsError = true;

      return;
    }

    const hasDefaultPrice = this.productPrices.some(priceObj => priceObj.setAsDefaultPrice);

    if (!hasDefaultPrice) {
      this.productPrices[0].setAsDefaultPrice = true;
    }
    this.productPrices = await this.adminService.uploadImagesAndSaveProduct(ProductViewText.ACCESSORIES, this.accessoryId, this.unifiedImageUrl, this.productPrices, this.selectedAccessoryType);

    // create new Clothing object
    this.accessoryObject = {
      id: this.accessoryId,
      productName: this.documentumHandler.makeUpperCaseEveryWordFirstLetter(this.createAccessoriesForm.value.productName),
      productCategory: this.selectedCategory,
      description: this.createAccessoriesForm.value.description,
      smallDescription: this.createAccessoriesForm.value.smallDescription,

      useUnifiedImage: this.isUnifiedImage,
      equipmentType: this.selectedAccessoryType,

      prices: this.productPrices
    }

    // Edit the accessory
    try {
      await this.db.collection("products").doc(ProductViewText.ACCESSORIES).collection("allProduct").doc(this.accessoryId).update(this.accessoryObject);

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
  }

  async deleteAccessory() {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      data: {
        text: DeleteConfirmationText.PRODUCT_DELETE
      }
    });

    // Wait for the dialog to close and get the user's confirmation
    const confirmToDeleteAddress = await dialogRef.afterClosed().toPromise();

    if (confirmToDeleteAddress) {
      try {
        // Delete images from Firebase Storage
        const deleteImagePromises = this.productPrices.map(async (price: ProductPrice) => {
          if (price.productImage) {
            try {
              // Reference the file by its URL
              const fileRef = this.storage.refFromURL(price.productImage);
              await fileRef.delete().toPromise();  // Attempt to delete the image
            } catch (error) { }
          }
        });

        // Await all delete promises
        await Promise.all(deleteImagePromises);

        // Delete all the images from the product storage folder
        await this.adminService.deleteAllFilesInFolder(ProductViewText.ACCESSORIES, this.accessoryId);

        // Delete the product from firestore
        const deleteAddressRef = this.db.collection("products").doc(ProductViewText.ACCESSORIES).collection("allProduct").doc(this.accessoryId);
        await deleteAddressRef.delete();
        this.dialog.open(SuccessfullDialogComponent, {
          data: {
            text: SuccessFullDialogText.DELETED_TEXT,
            needToGoPrevoiusPage: true
          }
        });
      } catch (error) {
      }
    }
  }

  back() {
    this.location.back();
  }
}
