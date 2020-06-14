import {Injectable} from '@angular/core';
import {BaseSecureApiService} from './api/base-secure.api.service';

@Injectable({
  providedIn: 'root'
})
export class ArtworkService {

  constructor(
    private _apiService: BaseSecureApiService
  ) {
  }

  getCategories() {
    return this._apiService.get('/categories');
  }

  getBook() {
    return this._apiService.get('/books/');
  }

  getBookIsbn(isbn) {
    return this._apiService.get('/books/isbn?isbn=' + isbn);
  }

  getBookById(id) {
    return this._apiService.get('/books/' + id);
  }

  getExhibitions() {
    return this._apiService.get('/exhibitions/');
  }

  getArtworks(id, params?) {
    return this._apiService.get('/profiles/' + id + '/artworks' + (params ? params : ''));
  }

  getArtwork(id) {
    return this._apiService.get('/artworks/' + id);
  }

  // TODO ????????????????????
  // getArtwork(id, params?) {
  //   return this._apiService.get('/profiles/' + id + '/artworks' + params);
  // }

  createArtwork(data) {
    return this._apiService.post('/artworks/', data);
  }

  updateArtwork(data) {
    return this._apiService.put('/artworks/' + data.id, data);
  }

  removeArtwork(id) {
    return this._apiService.delete('/artworks/' + id);
  }

  pushFile(data) {
    return this._apiService.pushFile('/tempfiles/', data);
  }

  // TODO ??????????????
  // pushFile(data) {
  //   return this._apiService.pushFile('/tempfiles/' + data.fileId, data);
  // }

  getFile(field) {
    return this._apiService.get('/tempfiles/' + field);
  }

  getArtworksByArtstorages(id) {
    return this._apiService.get('/artstorages/' + id + '/artworks');
  }

  removeTag(tagName) {
    return this._apiService.delete('/artworks/tags/' + tagName);
  }

  getCategoriesByProfile(profileId) {
    return this._apiService.get('/profiles/' + profileId + '/categories');
  }

  filesUpload(files) {
    // copy object files
    const tempFiles = Array.from(files);
    // add main file of artwork to send
    return new Promise((resolve, reject) => {
      const arrNew = tempFiles.filter(file => !file['_id']);
      let countNew = arrNew.length;
      tempFiles.map((file, index) => {
        if (!file['_id']) {
          const formData = new FormData();
          let toSend;
          if (file['file']) {
            toSend = file['file'];
          } else {
            toSend = file;
          }
          formData.append('file', toSend);
          this.pushFile(formData).subscribe(res => {
            file['_id'] = res.json()['tempfile']._id;
            countNew--;
            if (countNew === 0) resolve(tempFiles);
          }, error => {
            reject(error);
          });
        }
      });

    });
  }

  organizeFiles(files, mainFiles?, fromMain?) {
    let res = [];

    files.map(file => {
      if (file['_id']) res.push(file['_id']);
    });

    if (mainFiles !== undefined) {
      res.unshift(mainFiles._id);
      // set on the first position main file
      if (fromMain) res.unshift(res.splice((res.length - 1), 1)[0]);
    }

    return res;
  }

  generateFilesArr(id, last?) {
    return new Promise((resolve, reject) => {
      if (id) {
        let filesData: any;
        let filesUrl: any;
        this.getUrlFile(id, true).then(res => {
          // filesData.push(res);
          filesData = res;
          // this.galleryLinks(res);
          // if (last) {
          setTimeout(() => {
            // filesData = this.reverseArray(filesData, 'url');
            resolve(filesData);
          }, 200);
          // }
        });
      }
    });

    // if (id) {
    //   let filesData = [];
    //   let filesUrl: any;
    //   this.getUrlFile(id, true).then(res => {
    //     filesData.push(res);
    //     // this.galleryLinks(res);
    //     if (last) {
    //       setTimeout(() => {
    //         console.log('filesData', filesData);
    //         filesData = this.reverseArray(filesData);
    //         return filesData;
    //         // set main image in files part
    //         // if (filesData && filesData.length > 0) {
    //           // this.mainFiles = filesData.shift();
    //           // this.artworkData.image = this.mainFiles.url;
    //         // }
    //
    //         // filesUrl = this.reverseArray(filesUrl, 'url');
    //         // console.log('filesUrl  ', filesUrl);
    //
    //       }, 200)
    //     }
    //   });
    // }
  }

  getUrlFile(fileId, allData?) {
    return new Promise((resolve, reject) => {
      if (fileId) {
        this.getFile(fileId).subscribe(res => {
          if (res.file) {
            if (allData) {
              resolve(res.file);
            } else {
              resolve(res.file.url);
            }
          } else {
            resolve();
          }
        }, error => {
          reject(error);
        });
      }
    });
  }

  reverseArray(arr, type?) {
    const newArray = [];
    const arrCopy = Array.from(arr);
    if (type === 'url') {
      arrCopy.map((orFile: any) => {
        const filtered = arr.filter(file => orFile.url === file.url)[0];
        if (filtered) newArray.push(filtered);
      });
    } else {
      arrCopy.map(orFile => {
        const filtered = arr.filter(file => orFile === file._id)[0];
        if (filtered) newArray.push(filtered);
      });
    }
    return newArray;
  }
}
