import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormGroup, NgForm } from '@angular/forms';
import { Blog } from '../../blog.model';
import { Location } from '@angular/common';
import { Editor, Toolbar } from 'ngx-editor';
import { DocumentHandlerService } from '../../../../document.handler.service';
import { ProductViewText } from '../../../product-management/product-view-texts';
import { MatDialog } from '@angular/material/dialog';
import { SuccessfullDialogComponent } from '../../../../successfull-dialog/successfull-dialog.component';
import { SuccessFullDialogText } from '../../../../successfull-dialog/sucessfull-dialog-text';
import { ActivatedRoute } from '@angular/router';
import { DeleteConfirmationDialogComponent } from '../../../../delete-confirmation-dialog/delete-confirmation-dialog.component';
import { DeleteConfirmationText } from '../../../../delete-confirmation-dialog/delete-text';
import { Timestamp } from 'firebase/firestore';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { LoadingService } from '../../../../loading-spinner/loading.service';
import { DefaultImageUrl } from '../../../default-image-url';

@Component({
  selector: 'app-handle-blogs',
  templateUrl: './handle-blogs.component.html',
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
    ]),
  ]
})
export class HandleBlogsComponent implements OnInit {
  @ViewChild('form') createBlogForm: NgForm;  // Reference to the form for validation
  @ViewChild('fileInput') fileInput!: ElementRef; // To the upload image button management

  errorMessage: boolean = false;
  noTextError: boolean = false;
  titleAlreadyInUse: boolean = false;
  tagAlreadyExists: boolean = false;
  missingTagError: boolean = false;

  isBlogEdit: boolean = false;

  availableLanguages: string[] = [
    ProductViewText.HUNGARIAN,
    ProductViewText.ENGLISH
  ]
  selectedLanguage: string = '';

  imageBase64: string = DefaultImageUrl.blogUrl;
  imagePreview: string = DefaultImageUrl.blogUrl;

  tagInput: string = '';
  selectedTags: string[] = [];

  editor: Editor;
  toolbar: Toolbar;
  blogText: string = '';

  currentDate: Timestamp;

  blogObject: Blog;
  blogId: string = '';

  descriptionLength: number = 0;

  // responsibility
  isLargeScreen: boolean = false;

  constructor(
    private storage: AngularFireStorage,
    private db: AngularFirestore,
    private location: Location,
    private documentHandler: DocumentHandlerService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    public loadingService: LoadingService
  ) { }


  ngOnInit(): void {
    this.editor = new Editor();
    this.checkScreenSize();

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

    this.availableLanguages.sort((a, b) => a.localeCompare(b));

    this.blogObject = {
      id: "",
      title: "",
      htmlText: "",
      headerImageUrl: DefaultImageUrl.blogUrl,
      date: Timestamp.now(),
      language: "",
      blogTags: [],
      description: ""
    }

    this.route.params.subscribe(params => {
      // get the food supliment product by id
      this.documentHandler.getDocumentByID("blog", params['blogId']).subscribe((blog: Blog) => {
        // make a copy from the object
        this.blogObject = { ...blog };

        // if it's not undefinied (so the user want to edit a specified product not create a new)
        if (this.blogObject.title !== undefined) {
          this.blogId = this.blogObject.id;
          this.isBlogEdit = true;
          // pass the value to the object
          this.selectedLanguage = this.blogObject.language;

          // tags, image, description and blog text
          this.selectedTags = this.blogObject.blogTags;
          this.currentDate = this.blogObject.date;
          this.imageBase64 = this.blogObject.headerImageUrl;
          this.imagePreview = this.imageBase64;
          this.blogText = this.blogObject.htmlText;
          this.descriptionLength = this.blogObject.description.length;
        }
      });
    });
  }

  // display in 1 column the form fields on smaller screens and 2 columns on larger screens
  @HostListener('window:resize', [])
  onResize(): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    this.isLargeScreen = window.innerWidth > 900;
  }

  // make sure to destory the editor
  ngOnDestroy(): void {
    this.editor.destroy();
  }

  // add blog tag to the array
  addTag() {
    if (!this.selectedTags.includes(this.tagInput) && !this.selectedTags.includes(this.documentHandler.makeUpperCaseEveryWordFirstLetter(this.tagInput))) {
      this.selectedTags.push(this.documentHandler.makeUpperCaseEveryWordFirstLetter(this.tagInput));
      this.tagInput = '';
      this.tagAlreadyExists = false;
    } else {
      this.tagAlreadyExists = true;
    }
  }

  // Remove selected item
  removeItemFromTheList(item: string): void {
    this.removeItem(this.selectedTags, item);
    this.tagAlreadyExists = false;
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

  // Handle file selection and convert to Base64
  onFileSelected(event: any) {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imageBase64 = reader.result as string; // Base64 string
        this.imagePreview = this.imageBase64; // Preview for the user
      };
      reader.readAsDataURL(file);
    }
  }

  // Uploads the image to Firebase Storage and returns the download URL
  async uploadImage(blogId: string): Promise<string> {
    const base64Data = this.imageBase64.split(',')[1]; // Extract only the Base64 string
    const filePath = `Blog/${blogId}/${blogId}_main_blog_image`; // Define storage path with blogId
    const fileRef = this.storage.ref(filePath);
    const metadata = { contentType: 'image/jpeg' }; // Add metadata

    // Convert base64 string to Blob
    const blob = new Blob([Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))], { type: 'image/jpeg' });

    const task = this.storage.upload(filePath, blob, metadata); // Upload image as blob
    await task.snapshotChanges().toPromise(); // Wait for upload completion
    return fileRef.getDownloadURL().toPromise(); // Return the download URL
  }

  removeImage() {
    this.imageBase64 = DefaultImageUrl.blogUrl;
    this.imagePreview = this.imageBase64;
  }

  async addBlog() {
    await this.loadingService.withLoading(async () => {
      // Error handling for missing text
      if (this.blogText === '') {
        this.noTextError = true;
        return;
      }
      this.noTextError = false;

      if (this.selectedTags.length === 0) {
        this.missingTagError = true;
        return;
      }
      this.missingTagError = false;

      // Check for title duplication
      const blogTitle = this.documentHandler.makeUpperCaseEveryWordFirstLetter(this.createBlogForm.value.blogTitle);
      const isDuplicate = await this.documentHandler.checkForDuplication("blog", "title", blogTitle, undefined, "");

      if (isDuplicate) {
        this.titleAlreadyInUse = true;
        return;
      }

      this.titleAlreadyInUse = false;

      // the current date
      this.currentDate = Timestamp.now();

      // Create new blog object (without image URL initially)
      this.blogObject = {
        id: "",
        title: blogTitle,
        language: this.selectedLanguage,
        headerImageUrl: DefaultImageUrl.blogUrl,
        blogTags: this.selectedTags,
        htmlText: this.blogText,
        date: this.currentDate,
        description: this.createBlogForm.value.description
      };

      // Add the new blog
      try {
        // Add the new blog to Firestore and get the document reference
        const docRef = await this.db.collection("blog").add(this.blogObject);

        // Set the document ID as its own ID field
        await docRef.update({ id: docRef.id });

        // Upload image and get its URL
        let imageUrl = "";
        if (this.imageBase64 !== DefaultImageUrl.blogUrl) {
          imageUrl = await this.uploadImage(docRef.id);
        } else {
          imageUrl = DefaultImageUrl.blogUrl;
        }
        await docRef.update({ headerImageUrl: imageUrl });

        this.errorMessage = false;
        this.noTextError = false;
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

  async editBlog() {
    await this.loadingService.withLoading(async () => {
      // Error handling for missing text
      if (this.blogText === '') {
        this.noTextError = true;
        return;
      }
      this.noTextError = false;

      if (this.selectedTags.length === 0) {
        this.missingTagError = true;
        return;
      }
      this.missingTagError = false;

      // Check for title duplication
      const blogTitle = this.documentHandler.makeUpperCaseEveryWordFirstLetter(this.createBlogForm.value.blogTitle);
      const isDuplicate = await this.documentHandler.checkForDuplication("blog", "title", blogTitle, undefined, this.blogId);

      if (isDuplicate) {
        this.titleAlreadyInUse = true;
        return;
      }

      this.titleAlreadyInUse = false;

      // Upload image and get its URL
      let imageUrl = this.imageBase64;
      if (this.imageBase64 !== DefaultImageUrl.blogUrl && this.imageBase64.startsWith("data:image")) {
        imageUrl = await this.uploadImage(this.blogId);
      } else if (this.imageBase64 === '') {
        imageUrl = DefaultImageUrl.blogUrl;
      }

      // Create new blog object
      this.blogObject = {
        id: this.blogId,
        title: blogTitle,
        language: this.selectedLanguage,
        headerImageUrl: imageUrl,
        blogTags: this.selectedTags,
        htmlText: this.blogText,
        date: this.currentDate,
        description: this.createBlogForm.value.description
      };

      try {
        await this.db.collection("blog").doc(this.blogId).update(this.blogObject);

        this.errorMessage = false;
        this.noTextError = false;
        // if everything was success then open successful dialog
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

  async deleteBlog() {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      data: {
        text: DeleteConfirmationText.BLOG_DELETE
      }
    });

    // Wait for the dialog to close and get the user's confirmation
    const confirmToDeleteAddress = await dialogRef.afterClosed().toPromise();

    if (confirmToDeleteAddress) {
      await this.loadingService.withLoading(async () => {
        try {
          // Delete images from Firebase Storage
          if (this.blogObject.headerImageUrl && this.blogObject.headerImageUrl !== DefaultImageUrl.blogUrl) {
            try {
              // Reference the file by its URL
              const fileRef = this.storage.refFromURL(this.blogObject.headerImageUrl);
              await fileRef.delete().toPromise();  // Attempt to delete the image
            } catch (error) { }
          }

          // Delete the blog from firestore
          const deleteAddressRef = this.db.collection("blog").doc(this.blogId);
          await deleteAddressRef.delete();
          this.dialog.open(SuccessfullDialogComponent, {
            data: {
              text: SuccessFullDialogText.DELETED_TEXT,
              needToGoPrevoiusPage: true
            }
          });
        } catch (error) {
        }
      });
    }
  }

  back() {
    this.location.back();
  }
}
