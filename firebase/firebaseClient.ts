"use client";

import {initializeApp} from "firebase/app";
import {getMessaging, isSupported} from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBice1UYaz_f7YqQm_Z893C4sxnBuw-RBA",
  authDomain: "my-pwa-9f416.firebaseapp.com",
  projectId: "my-pwa-9f416",
  storageBucket: "my-pwa-9f416.firebasestorage.app",
  messagingSenderId: "704142812850",
  appId: "1:704142812850:web:430cccbb9bc716cb450bab",
};

const app = initializeApp(firebaseConfig);

// messaging 초기화는 브라우저 환경에서만 진행합니다.
let messaging: ReturnType<typeof getMessaging> | null = null;

if (typeof window !== "undefined") {
  // Firebase Messaging이 현재 환경에서 지원되는지 확인합니다.
  isSupported()
    .then((supported) => {
      if (supported) {
        messaging = getMessaging(app);
      } else {
        console.warn("Firebase Messaging은 이 브라우저에서 지원되지 않습니다.");
      }
    })
    .catch((err) => {
      console.error("Firebase Messaging 지원 여부 확인 실패:", err);
    });
}

export {app, messaging};
