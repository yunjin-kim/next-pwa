import {initializeApp} from "firebase/app";
import {getMessaging, isSupported, onMessage} from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBice1UYaz_f7YqQm_Z893C4sxnBuw-RBA",
  authDomain: "my-pwa-9f416.firebaseapp.com",
  projectId: "my-pwa-9f416",
  storageBucket: "my-pwa-9f416.firebasestorage.app",
  messagingSenderId: "704142812850",
  appId: "1:704142812850:web:430cccbb9bc716cb450bab",
};

const app = initializeApp(firebaseConfig);

let messaging: ReturnType<typeof getMessaging> | null = null;

if (typeof window !== "undefined") {
  // Only initialize messaging if we're in the browser
  isSupported()
    .then((supported) => {
      if (!supported) {
        console.warn("Firebase Messaging은 이 브라우저에서 지원되지 않습니다.");
      } else {
        messaging = getMessaging(app);
        onMessage(messaging, (payload) => {
          console.log("Message received. ", payload);
          // notification을 받았을 때 처리하는 로직을 작성합니다.
          // 하면 끝
          Notification.requestPermission().then((permission) => {
            // If the user accepts, let's create a notification
            if (permission === "granted") {
              new Notification(payload.data?.title || "", {
                body: payload.data?.body || "",
              });
              // …
            }
          });
        });
      }
    })
    .catch((err) => {
      console.error("Firebase Messaging 지원 여부 확인 실패:", err);
    });
}

export {app, messaging};
