import React from "react";

const OfflinePage: React.FC = () => {
  return (
    <div style={{padding: "2rem", textAlign: "center"}}>
      <h1>오프라인입니다</h1>
      <p>현재 네트워크 연결이 원활하지 않습니다. 나중에 다시 시도해주세요.</p>
    </div>
  );
};

export default OfflinePage;
