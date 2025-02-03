"use client";

// firebase/firebaseClient.ts
import {initializeApp} from "firebase/app";
import {getMessaging} from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBice1UYaz_f7YqQm_Z893C4sxnBuw-RBA",
  authDomain: "my-pwa-9f416.firebaseapp.com",
  projectId: "my-pwa-9f416",
  storageBucket: "my-pwa-9f416.firebasestorage.app",
  messagingSenderId: "704142812850",
  appId: "1:704142812850:web:430cccbb9bc716cb450bab",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export {app, messaging};
