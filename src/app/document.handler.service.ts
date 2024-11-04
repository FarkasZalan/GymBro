import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Observable } from "rxjs";
import { Blog } from "./admin-profile/blog/blog.model";

@Injectable({
  providedIn: 'root'
})
export class DocumentHandlerService {

  constructor(private db: AngularFirestore) { }

  getDocumentByID(mainCollection: string, mainDocumentId: string) {
    return this.db.collection(mainCollection).doc(mainDocumentId).valueChanges();
  }

  getInnerDocumentByID(mainCollection: string, mainDocumentId: string, innerCollection: string, innerDocumentId: string) {
    return this.db.collection(mainCollection).doc(mainDocumentId).collection(innerCollection).doc(innerDocumentId).valueChanges();
  }

  // When register a user then it's useful for upper and lowercase handleing
  makeUpperCaseUserName(name: string) {
    return name[0].toUpperCase() + name.slice(1).toLowerCase();
  }

  // When create a new address it can be useful because of the lowercase and uppercase typo
  makeUpperCaseEveryWordFirstLetter(text: string) {
    text = text.trim();  // Trim leading/trailing whitespaces
    text = text.replace(/\s+/g, " ");  // Replace multiple spaces with a single space

    const words = text.split(" ");  // Split text by spaces
    let uppercaseText = "";

    for (let i = 0; i < words.length; i++) {
      // Capitalize the first letter and make the rest lowercase
      words[i] = words[i][0].toUpperCase() + words[i].substr(1).toLowerCase();
    }

    // Join words with a single space and return the result
    uppercaseText = words.join(" ");

    return uppercaseText;
  }

  checkForDuplication(collection: string, fieldName: string, inputString?: string, inputBoolean?: boolean, ownId: string = "") {
    return new Promise<boolean>((resolve, reject) => {
      // Determine the value of `input` based on whether inputString or inputBoolean is provided
      let input: string | boolean;

      if (inputString !== undefined && inputString !== null) {
        input = inputString;  // If inputString is valid, use its value
      } else if (inputBoolean !== undefined && inputBoolean !== null) {
        input = inputBoolean;  // If inputBoolean is valid, use its value as a boolean
      }
      this.db
        .collection(collection)
        .ref
        .where(fieldName, '==', input)
        .where("id", "!=", ownId) // found a match in one document which is not his own 
        .get() // then we get the document
        .then(document => {
          if (!document.empty) { // if it's not empty
            // then return true
            resolve(true);
          } else {
            // not found the given input so it's return with false
            resolve(false);
          }
        })
        .catch(error => {
          // if get error then reject the promise (so false)
          reject(error);
        });
    });
  }

  checkForDuplicationInnerCollection(collection: string, innerDocument: string, innerCollection: string, fieldName: string, inputString?: string, inputBoolean?: boolean, ownId: string = "") {
    return new Promise<boolean>((resolve, reject) => {
      // Determine the value of `input` based on whether inputString or inputBoolean is provided
      let input: string | boolean;

      if (inputString !== undefined && inputString !== null) {
        input = inputString;  // If inputString is valid, use its value
      } else if (inputBoolean !== undefined && inputBoolean !== null) {
        input = inputBoolean;  // If inputBoolean is valid, use its value as a boolean
      }
      this.db
        .collection(collection)
        .doc(innerDocument)
        .collection(innerCollection)
        .ref
        .where(fieldName, '==', input)
        .where("id", "!=", ownId) // found a match in one document which is not his own 
        .get() // then we get the document
        .then(document => {
          if (!document.empty) { // if it's not empty
            // then return true
            resolve(true);
          } else {
            // not found the given input so it's return with false
            resolve(false);
          }
        })
        .catch(error => {
          // if get error then reject the promise (so false)
          reject(error);
        });
    });
  }


  // Fetch related blogs based on tags and language
  getRelatedBlogs(tags: string[], currentBlogId: string, language: string): Observable<Blog[]> {
    return this.db.collection<Blog>('blog', ref =>
      ref
        .where('id', '!=', currentBlogId)
        .where('language', '==', language)
        .where('blogTags', 'array-contains-any', tags)
        .orderBy('date')
        .limit(6)
    ).valueChanges();
  }

  // Fetch random blogs based on language
  getRandomBlogs(currentBlogId: string, limit: number, language: string): Observable<Blog[]> {
    return this.db.collection<Blog>('blog', ref =>
      ref
        .where('id', '!=', currentBlogId)
        .where('language', '==', language)
        .orderBy('date').
        limit(limit)
    ).valueChanges();
  }
}