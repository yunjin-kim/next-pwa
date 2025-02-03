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
    body: payload.notification?.body || "",
    icon: "/firebase-logo.png", // 적절한 아이콘 파일 경로
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
