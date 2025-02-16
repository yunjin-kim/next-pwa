// public/sw.js

const CACHE_DB_NAME = "offline-cache-db";
const CACHE_STORE_NAME = "responses";
const CACHE_DB_VERSION = 1;

// IndexedDB 데이터베이스를 열고 object store를 생성하는 함수
function openCacheDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(CACHE_DB_NAME, CACHE_DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = request.result;
      console.log("___openCacheDB____", db);
      if (!db.objectStoreNames.contains(CACHE_STORE_NAME)) {
        db.createObjectStore(CACHE_STORE_NAME);
      }
    };
    request.onsuccess = (event) => {
      resolve(request.result);
    };
    request.onerror = (event) => {
      reject(request.error);
    };
  });
}

// 특정 URL을 키로 해서 response Blob을 IndexedDB에 저장
function saveResponseToDB(url, blob) {
  return openCacheDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(CACHE_STORE_NAME, "readwrite");
      const store = transaction.objectStore(CACHE_STORE_NAME);
      const req = store.put(blob, url);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  });
}

// IndexedDB에서 특정 URL에 해당하는 Blob 데이터를 가져옴
function getResponseFromDB(url) {
  return openCacheDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(CACHE_STORE_NAME, "readonly");
      const store = transaction.objectStore(CACHE_STORE_NAME);
      const req = store.get(url);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  });
}

// fetch 이벤트 리스너: GET 요청에 대해 네트워크 시도 후 실패 시 IndexedDB 캐시에서 응답 반환
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return; // GET 요청에만 적용

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 네트워크 응답이 성공적이면, 복제하여 IndexedDB에 저장 후 원본 응답 반환
        if (response && response.status === 200) {
          const responseClone = response.clone();
          responseClone.blob().then((blob) => {
            saveResponseToDB(event.request.url, blob).catch((err) => {
              console.error("IndexedDB 저장 실패:", err);
            });
          });
        }
        return response;
      })
      .catch(() => {
        // 네트워크 실패 시 IndexedDB에서 캐시된 데이터를 읽어옴
        return getResponseFromDB(event.request.url).then((blob) => {
          if (blob) {
            // MIME 타입은 필요에 따라 설정 (여기서는 text/html 예시)
            return new Response(blob, {headers: {"Content-Type": "text/html"}});
          }
          // 캐시 데이터가 없다면 기본 응답 반환
          return new Response("오프라인 상태이며, 캐시된 데이터가 없습니다.", {
            status: 503,
            statusText: "Service Unavailable",
          });
        });
      })
  );
});
