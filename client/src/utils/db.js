const DB_NAME = 'searchResultsDB';
const STORE_NAME = 'searchResultsStore';

export const saveResultsToDB = (results) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      const store = db.createObjectStore(STORE_NAME, { autoIncrement: true });
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      results.forEach(result => {
        store.add(result);
      });

      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
    };

    request.onerror = () => {
      reject('Error saving results to database.');
    };
  });
};

export const getResultsFromDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const results = [];

      store.openCursor().onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          db.close();
          resolve(results);
        }
      };
    };

    request.onerror = () => {
      reject('Error retrieving results from database.');
    };
  });
};
