interface OfflineData {
  id?: number;
  [key: string]: unknown;
}

// IndexedDB 데이터베이스 열기 및 초기화 함수
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("OfflineDB", 1);
    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      // "offlineData" 오브젝트 스토어 생성 (키 경로: "id", autoIncrement 사용)
      if (!db.objectStoreNames.contains("offlineData")) {
        db.createObjectStore("offlineData", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };
    request.onsuccess = (event: Event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };
    request.onerror = (event: Event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

// 데이터를 IndexedDB에 저장하는 함수
export async function saveDataLocally(data: OfflineData): Promise<number> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("offlineData", "readwrite");
    const store = transaction.objectStore("offlineData");
    const request = store.add(data);
    request.onsuccess = (event: Event) => {
      resolve((event.target as IDBRequest).result as number); // 저장된 데이터의 id 반환
    };
    request.onerror = (event: Event) => {
      reject((event.target as IDBRequest).error);
    };
  });
}

// IndexedDB에서 저장된 모든 데이터를 가져오는 함수
export async function getQueuedData(): Promise<OfflineData[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("offlineData", "readonly");
    const store = transaction.objectStore("offlineData");
    const request = store.getAll();
    request.onsuccess = (event: Event) => {
      resolve((event.target as IDBRequest).result as OfflineData[]);
    };
    request.onerror = (event: Event) => {
      reject((event.target as IDBRequest).error);
    };
  });
}

// IndexedDB에서 특정 데이터를 삭제하는 함수 (전송 성공 후 호출)
export async function removeData(id: number): Promise<boolean> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("offlineData", "readwrite");
    const store = transaction.objectStore("offlineData");
    const request = store.delete(id);
    request.onsuccess = () => resolve(true);
    request.onerror = (event: Event) =>
      reject((event.target as IDBRequest).error);
  });
}

// Background Sync를 위한 데이터 동기화 함수
export async function syncData(): Promise<void> {
  try {
    // IndexedDB에서 오프라인 데이터를 모두 가져옵니다.
    const offlineData = await getQueuedData();
    // 가져온 데이터를 순회하며 서버의 API 엔드포인트로 전송합니다.
    for (const data of offlineData) {
      await fetch("/api/content", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
      });
      // 전송 성공 시 해당 데이터를 IndexedDB에서 제거합니다.
      await removeData(data.id!);
    }
  } catch (error) {
    console.error("Background sync 실패:", error);
    throw error;
  }
}
