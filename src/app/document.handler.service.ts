import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";

@Injectable({
  providedIn: 'root'
})
export class DocumentHandlerService {
  constructor(private db: AngularFirestore) { }

  getAllDocument(collectionName: string) {
    return this.db.collection(collectionName).valueChanges();
  }

  getDocumentByID(collection: string, documentId: string) {
    return this.db.collection(collection).doc(documentId).valueChanges();
  }

  async deleteDocument(collectionName: string, id: string) {
    try {
      const deleteUserRef = this.db.collection(collectionName).doc(id);
      await deleteUserRef.update({
        deleted: true
      });
    } catch { }
  }

  async updateDocument(collection: string, documentId: string) {
    return new Promise<boolean>((resolve, reject) => {
      let updatedDocument = null
      this.getDocumentByID(collection, documentId).subscribe((document) => {
        updatedDocument = document;
        this.db.collection(collection).doc(documentId).set(updatedDocument).then(() => {
          resolve(true);
        }).catch(() => {
          resolve(false);
        });
      });
    });
  }

  makeUpperCaseUserName(name: string) {
    return name[0].toUpperCase() + name.slice(1).toLowerCase();
  }

  makeUpperCaseEveryWordFirstLetter(text: string) {
    text = text.trim();
    const words = text.split(" ");
    let uppercaseText = "";

    for (let i = 0; i < words.length; i++) {
      words[i] = words[i][0].toUpperCase() + words[i].substr(1);
      uppercaseText += words[i] + " "
    }
    return uppercaseText;
  }

  checkForDuplication(collection: string, fieldName: string, input: string, ownId: string = "") {
    return new Promise<boolean>((resolve, reject) => {
      this.db.collection(collection).ref
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
}