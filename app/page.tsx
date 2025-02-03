"use client";

import {useState} from "react";
import {messaging} from "../firebase1/firebaseCient";
import {getToken} from "firebase/messaging";
import axios from "axios";

const Home = () => {
  const [token, setToken] = useState<string | null>(null);

  // Service Worker 등록 후 registration 객체를 저장
  const registerServiceWorkerAndRequestToken = async () => {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );
        console.log("서비스 워커 등록 완료 ✅", registration);

        // 알림 권한 요청 및 토큰 발급
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          // registration 객체를 옵션에 함께 전달합니다.
          getToken(messaging, {
            vapidKey:
              "BBkb6fJ-k2CQXhtsrwKY2Gm9TcbN4Vj4K6UYS1LUsMypsQr8UD6GiNFezI1NA2WUC4p11zTG0ARYepAbnPUZ2bo",
            serviceWorkerRegistration: registration,
          })
            .then((currentToken) => {
              if (currentToken) {
                setToken(currentToken);
                console.log("FCM 토큰:", currentToken);
                // TODO: 이 토큰을 서버에 저장하여 이후 푸시 알림 전송에 사용
              } else {
                console.warn("토큰이 생성되지 않았습니다. 권한을 확인하세요.");
              }
            })
            .catch((err) => {
              console.error("토큰 수신 오류:", err);
            });
        } else {
          console.warn("알림 권한이 거부되었습니다.");
        }
      } catch (error) {
        console.error("서비스 워커 등록 실패 ❌", error);
      }
    } else {
      console.warn("서비스 워커를 지원하지 않는 브라우저입니다.");
    }
  };

  const fetchFCMTokenToServer = async () => {
    if (!token) {
      alert("토큰을 먼저 발급받아야 합니다.");
      return;
    }

    await axios.post("/api/sendNotification", {
      token,
      title: "푸시 알림 테스트",
      body: "푸시 알림이 성공적으로 전송되었습니다.",
    });
  };

  return (
    <div style={{padding: "2rem"}}>
      <h1>푸시 알림 예제</h1>
      <button onClick={registerServiceWorkerAndRequestToken}>
        알림 허용하는 척하면서 토큰 발급
      </button>

      {token ? (
        <div>
          <p>발급받은 FCM 토큰:</p>
          <textarea
            readOnly
            value={token}
            rows={5}
            style={{width: "100%"}}
          ></textarea>
        </div>
      ) : (
        <p>토큰을 아직 받지 못했습니다.</p>
      )}

      <button onClick={fetchFCMTokenToServer}>토큰 서버로 전달</button>
    </div>
  );
};

export default Home;
