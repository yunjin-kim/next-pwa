import {useEffect, useState} from "react";

const OfflineAllow = () => {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
    };

    // 온라인/오프라인 이벤트 리스너 등록
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    // 초기 상태 설정
    updateOnlineStatus();

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  return (
    <div>
      {isOffline ? (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: "#f44336",
            color: "#fff",
            textAlign: "center",
            padding: "0.5rem",
            zIndex: 1000,
            fontSize: "0.9rem",
          }}
        >
          OFFLINE
        </div>
      ) : (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: "black",
            color: "#fff",
            textAlign: "center",
            padding: "0.5rem",
            zIndex: 1000,
            fontSize: "0.9rem",
          }}
        >
          ONLINE
        </div>
      )}
    </div>
  );
};

export default OfflineAllow;
