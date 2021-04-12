import 'whatwg-fetch';
import Screen from '../models/Screen';
import AttachmentFetcher from './AttachmentFetcher';
import BaseFetcher from './BaseFetcher';
import GenericElsFetcher from './GenericElsFetcher';

export default class ScreensFetcher {
  static fetchById(id) {
    const promise = fetch(`/api/v1/screens${id}.json`, {
      credentials: 'same-origin'
    })
      .then(response => response.json())
      .then((json) => {
        const rScreen = new Screen(json.screen);
        if (json.error) {
          rScreen.id = `${id}:error:Screen ${id} is not accessible!`;
        }
        return rScreen;
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });
    return promise;
  }

  static fetchByCollectionId(id, queryParams = {}, isSync = false) {
    return BaseFetcher.fetchByCollectionId(id, queryParams, isSync, 'screens', Screen);
  }

  static update(screen) {
    const files = AttachmentFetcher.getFileListfrom(screen.container);
    const promise = () => fetch(`/api/v1/screens/${screen.id}`, {
      credentials: 'same-origin',
      method: 'put',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(screen.serialize())
    }).then(response => response.json())
      .then(json => GenericElsFetcher.uploadGenericFiles(screen, json.screen.id, 'Screen')
        .then(() => this.fetchById(json.screen.id))).catch((errorMessage) => {
        console.log(errorMessage);
      });
      
    if (files.length > 0) {
      let tasks = [];
      files.forEach(file => tasks.push(AttachmentFetcher.uploadFile(file).then()));
      return Promise.all(tasks).then(() => {
        return promise();
      });
    }
    return promise();
  }

  static create(screen) {
    const files = AttachmentFetcher.getFileListfrom(screen.container);

    const promise = () => fetch('/api/v1/screens/', {
      credentials: 'same-origin',
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(screen.serialize())
    }).then(response => response.json())
      .then(json => GenericElsFetcher.uploadGenericFiles(screen, json.screen.id, 'Screen')
        .then(() => this.fetchById(json.screen.id))).catch((errorMessage) => {
        console.log(errorMessage);
      });

    if (files.length > 0) {
      let tasks = [];
      files.forEach(file => tasks.push(AttachmentFetcher.uploadFile(file).then()));
      return Promise.all(tasks).then(() => {
        return promise();
      });
    }
    return promise();
  }
}
