// app/api/sendNotification/route.ts
import {NextResponse} from "next/server";
import admin from "firebase-admin";

// Firebase Admin 초기화 (한 번만 실행)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID,
      clientEmail: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY!.replace(
        /\\n/g,
        "\n"
      ),
    }),
  });
}

// POST 메서드 처리 핸들러
export async function POST(request: Request) {
  try {
    console.log("알림 전송 요청 받음");
    const {token, title, body} = await request.json();

    if (!token || !title || !body) {
      return NextResponse.json(
        {error: "필수 파라미터가 누락되었습니다."},
        {status: 400}
      );
    }

    console.log("알림 전송 요청:", {token, title, body});

    const message = {
      notification: {
        title,
        body,
      },
      token,
    };

    const response = await admin.messaging().send(message);
    return NextResponse.json({message: "알림 전송 성공", response});
  } catch (error) {
    console.error("알림 전송 에러:", error);
    return NextResponse.json({error: "알림 전송 실패"}, {status: 500});
  }
}
