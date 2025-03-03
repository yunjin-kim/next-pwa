// // public/sw.js

// const CACHE_DB_NAME = "offline-cache-db";
// const CACHE_STORE_NAME = "responses";
// const CACHE_DB_VERSION = 1;

// // IndexedDB 데이터베이스를 열고 object store를 생성하는 함수
// function openCacheDB() {
//   return new Promise((resolve, reject) => {
//     const request = indexedDB.open(CACHE_DB_NAME, CACHE_DB_VERSION);
//     request.onupgradeneeded = (event) => {
//       const db = request.result;
//       console.log("___openCacheDB____", db);
//       if (!db.objectStoreNames.contains(CACHE_STORE_NAME)) {
//         db.createObjectStore(CACHE_STORE_NAME);
//       }
//     };
//     request.onsuccess = (event) => {
//       resolve(request.result);
//     };
//     request.onerror = (event) => {
//       reject(request.error);
//     };
//   });
// }

// // 특정 URL을 키로 해서 response Blob을 IndexedDB에 저장
// function saveResponseToDB(url, blob) {
//   return openCacheDB().then((db) => {
//     return new Promise((resolve, reject) => {
//       const transaction = db.transaction(CACHE_STORE_NAME, "readwrite");
//       const store = transaction.objectStore(CACHE_STORE_NAME);
//       const req = store.put(blob, url);
//       req.onsuccess = () => resolve();
//       req.onerror = () => reject(req.error);
//     });
//   });
// }

// // IndexedDB에서 특정 URL에 해당하는 Blob 데이터를 가져옴
// function getResponseFromDB(url) {
//   return openCacheDB().then((db) => {
//     return new Promise((resolve, reject) => {
//       const transaction = db.transaction(CACHE_STORE_NAME, "readonly");
//       const store = transaction.objectStore(CACHE_STORE_NAME);
//       const req = store.get(url);
//       req.onsuccess = () => resolve(req.result);
//       req.onerror = () => reject(req.error);
//     });
//   });
// }

// // fetch 이벤트 리스너: GET 요청에 대해 네트워크 시도 후 실패 시 IndexedDB 캐시에서 응답 반환
// self.addEventListener("fetch", (event) => {
//   if (event.request.method !== "GET") return; // GET 요청에만 적용

//   event.respondWith(
//     fetch(event.request)
//       .then((response) => {
//         // 네트워크 응답이 성공적이면, 복제하여 IndexedDB에 저장 후 원본 응답 반환
//         if (response && response.status === 200) {
//           const responseClone = response.clone();
//           responseClone.blob().then((blob) => {
//             saveResponseToDB(event.request.url, blob).catch((err) => {
//               console.error("IndexedDB 저장 실패:", err);
//             });
//           });
//         }
//         return response;
//       })
//       .catch(() => {
//         // 네트워크 실패 시 IndexedDB에서 캐시된 데이터를 읽어옴
//         return getResponseFromDB(event.request.url).then((blob) => {
//           if (blob) {
//             // MIME 타입은 필요에 따라 설정 (여기서는 text/html 예시)
//             return new Response(blob, {headers: {"Content-Type": "text/html"}});
//           }
//           // 캐시 데이터가 없다면 기본 응답 반환
//           return new Response("오프라인 상태이며, 캐시된 데이터가 없습니다.", {
//             status: 503,
//             statusText: "Service Unavailable",
//           });
//         });
//       })
//   );
// });

// Firebase App 과 Messaging 스크립트를 가져옵니다.
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

// Firebase 초기화 (클라이언트와 동일한 설정 사용)
firebase.initializeApp({
  apiKey: "AIzaSyBice1UYaz_f7YqQm_Z893C4sxnBuw-RBA",
  authDomain: "my-pwa-9f416.firebaseapp.com",
  projectId: "my-pwa-9f416",
  storageBucket: "my-pwa-9f416.firebasestorage.app",
  messagingSenderId: "704142812850",
  appId: "1:704142812850:web:430cccbb9bc716cb450bab",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log("[firebase-messaging-sw.js] 백그라운드 메시지 수신", payload);

  const notificationTitle = payload.notification?.title || "알림";
  const notificationOptions = {
    title: Date.now().toString(),
    body: payload.notification?.body || "",
    icon: "/firebase-logo.png", // 적절한 아이콘 파일 경로
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-data") {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  try {
    // IndexedDB나 다른 스토리지에서 오프라인 저장 데이터를 가져옵니다.
    const offlineData = await getQueuedData(); // getQueuedData는 사용자가 구현하는 함수
    // 저장된 데이터를 순회하며 서버의 API 엔드포인트로 전송합니다.
    for (const data of offlineData) {
      await fetch("/api/content", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
      });
      // 전송에 성공하면 해당 데이터는 오프라인 큐에서 제거합니다.
    }
  } catch (error) {
    console.error("Background sync 실패:", error);
    throw error;
  }
}

// IndexedDB 등에서 데이터를 가져오는 함수를 구현해야 합니다.
async function getQueuedData() {
  // 예시: IndexedDB에서 오프라인 데이터를 읽어오는 로직
  return []; // 실제 구현에 맞게 수정하세요.
}
