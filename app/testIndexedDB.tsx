"use client";

import React, {useEffect, useState} from "react";

interface Customer {
  ssn: string;
  name: string;
  age: number;
  email: string;
}

const dbName = "next-pwa-db";

const customerData: Customer[] = [
  {ssn: "444-44-4444", name: "Bill", age: 35, email: "bill@company.com"},
  {ssn: "555-55-5555", name: "Donna", age: 32, email: "donna@home.org"},
];

const TestIndexedDB = () => {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [retrievedCustomers, setRetrievedCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    if (!window.indexedDB) {
      window.alert(
        "Your browser doesn't support a stable version of IndexedDB. Some features may not be available."
      );
      return;
    }

    // 데이터베이스 버전을 명시하여 open 호출 (버전 1)
    const request: IDBOpenDBRequest = window.indexedDB.open(dbName, 2);

    request.onerror = (event) => {
      console.error("Database error: ", event);
    };

    request.onsuccess = () => {
      const database = request.result;
      console.log("Database opened successfully:", database);
      setDb(database);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      console.log("Database upgrade needed:", event);

      // customers objectStore가 없으면 생성
      if (!database.objectStoreNames.contains("customers")) {
        const objectStore = database.createObjectStore("customers", {
          keyPath: "ssn",
        });
        objectStore.createIndex("name", "name", {unique: false});
        objectStore.createIndex("email", "email", {unique: true});

        objectStore.transaction.oncomplete = () => {
          const customerObjectStore = database
            .transaction("customers", "readwrite")
            .objectStore("customers");
          customerData.forEach((customer) => {
            customerObjectStore.add(customer);
          });
        };
      }
    };
  }, []);

  const addDataIndexedDB = () => {
    if (!db) {
      console.log("DB 연결 안됨");
      return;
    }

    const transaction = db.transaction("customers", "readwrite");

    transaction.oncomplete = () => {
      alert("All done!");
    };

    transaction.onerror = (event) => {
      console.error("Transaction error:", event);
    };

    const objectStore = transaction.objectStore("customers");
    customerData.forEach((customer, index) => {
      const request = objectStore.add(customer);
      request.onsuccess = (event) => {
        console.log(
          `customerData[${index}] has been added to your database.`,
          event
        );
      };
      request.onerror = (event) => {
        console.error(`Error adding customerData[${index}]:`, event);
      };
    });
  };

  const getDataIndexedDB = () => {
    if (!db) {
      console.log("DB 연결 안됨");
      return;
    }

    const transaction = db.transaction("customers", "readonly");
    const objectStore = transaction.objectStore("customers");
    // 모든 데이터를 조회합니다.
    const request = objectStore.getAll();

    request.onsuccess = () => {
      const result = request.result as Customer[];
      setRetrievedCustomers(result);
      console.log("Retrieved customers: ", result);
    };

    request.onerror = (event) => {
      console.error("Error fetching customer data:", event);
    };
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "2rem",
      }}
    >
      <h1>IndexedDB Test</h1>
      <h2>{db ? "DB 연결됨" : "DB 연결 안됨"}</h2>
      <button onClick={addDataIndexedDB}>db에 값 추가</button>
      <button onClick={getDataIndexedDB}>db에서 값 조회</button>

      {retrievedCustomers.length > 0 && (
        <div>
          <h3>조회한 고객 데이터:</h3>
          <ul>
            {retrievedCustomers.map((customer) => (
              <li key={customer.ssn}>
                {customer.ssn} - {customer.name} - {customer.age} -{" "}
                {customer.email}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TestIndexedDB;
