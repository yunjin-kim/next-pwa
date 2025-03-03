"use client";

import {useEffect, useRef, useState} from "react";
import {messaging} from "../firebase/firebaseClient";
import {getToken} from "firebase/messaging";
import axios from "axios";
import OfflineAllow from "./offlineAllow";
import {getQueuedData, removeData, saveDataLocally} from "./utils/offlinedb";

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
        if (permission === "granted" && messaging) {
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

    await axios.post("/api/sendToken", {token});
  };

  const pushNotification = async () => {
    const res = await axios.post("/api/sendNotification", {
      title: "푸시 알림 테스트",
      body: "푸시 알림이 성공적으로 전송되었습니다.",
    });
    console.log("pushNotification결과", res.data);
  };

  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handleOnline = async () => {
      console.log("온라인 상태 감지됨: 오프라인 데이터를 서버로 동기화합니다.");
      try {
        // IndexedDB에서 저장된 모든 데이터를 가져옵니다.
        const offlineData = await getQueuedData();
        for (const data of offlineData) {
          try {
            // 오프라인에 저장된 데이터를 서버 API로 전송
            const res = await axios.post("/api/content", data);
            console.log("오프라인 데이터 서버 전송 성공:", res.data);
            // 전송 성공 시 IndexedDB에서 해당 데이터를 삭제
            if (data.id) {
              await removeData(data.id);
            } else {
              console.error("전송 성공, 하지만 ID가 없습니다.");
            }
          } catch (error) {
            console.error("오프라인 데이터 전송 실패:", error);
            // 특정 데이터 전송 실패 시 해당 데이터는 그대로 유지하여 다음에 재시도할 수 있습니다.
          }
        }
      } catch (error) {
        console.error("오프라인 데이터 동기화 중 에러 발생:", error);
      }
    };

    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  const postContent = async () => {
    if (!contentRef.current) return;

    console.log("contentRef.current", contentRef.current.value);

    const contentData = contentRef.current.value;

    try {
      const res = await axios.post(
        "/api/content",
        JSON.stringify({
          id: Date.now(),
          content: contentData,
        })
      );
      console.log("fetchContent결과", res.data);
    } catch (error) {
      console.error("서버 전송 실패, 로컬에 저장합니다.", error);
      // 네트워크 문제 등으로 전송 실패 시 IndexedDB에 저장
      await saveDataLocally({
        id: Date.now(),
        content: contentData,
      });
    }

    if ("serviceWorker" in navigator && "SyncManager" in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.sync
          .register("sync-data")
          .then(() => console.log("Background sync 등록됨"))
          .catch((err) => console.error("Background sync 등록 실패:", err));
      });
    }
  };

  const getContentRef = useRef<HTMLTextAreaElement>(null);

  const fetchContent = async () => {
    if (!getContentRef.current) return;

    console.log("getContentRef.current", getContentRef.current.value);

    const res = await axios.get("/api/content");
    console.log("fetchContent결과", res.data);
    const contentRes = await res.data.data
      .map((d) => `${d.id}: ${d.content}`)
      .join("\n");
    getContentRef.current.value = contentRes;
  };

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("서비스 워커 등록 성공:", reg))
        .catch((err) => console.error("서비스 워커 등록 실패:", err));
    }
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: "2rem",
      }}
    >
      <OfflineAllow />

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

      <button onClick={pushNotification}>푸시 알림 전송</button>

      <textarea ref={contentRef} rows={5} style={{width: "100%"}} />

      <button onClick={postContent}>콘텐츠 저장</button>

      <textarea ref={getContentRef} rows={5} style={{width: "100%"}} />

      <button onClick={fetchContent}>콘텐츠 불러오기</button>
    </div>
  );
};

export default Home;
