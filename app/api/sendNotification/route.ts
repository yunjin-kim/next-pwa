// app/api/sendNotification/route.ts
import {NextResponse} from "next/server";
import admin from "firebase-admin";
import {tokenStorage} from "../sendToken/route";
import {getMessaging} from "firebase-admin/messaging";

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
    const {title, body} = await request.json();

    if (!title || !body) {
      return NextResponse.json(
        {error: "필수 파라미터가 누락되었습니다."},
        {status: 400}
      );
    }

    console.log("알림 전송 요청:", {title, body});

    const tokens = Array.from(tokenStorage.values());

    console.log("저장된 토큰:", tokens);

    if (tokens.length === 0) {
      return NextResponse.json({error: "토큰이 없습니다."}, {status: 400});
    }

    const message = {
      data: {
        title,
        body,
      },
      // tokens
    };

    admin
      .messaging()
      .sendMulticast({tokens, ...message})
      .then((response) => {
        console.log("멀티캐스트 알림 전송 성공:", response);
      })
      .catch((error) => {
        console.error("알림 전송 오류:", error);
      }); // admin
    //   .messaging()
    //   .sendMulticast({tokens, ...messagePayload})
    //   .then((response) => {
    //     console.log("멀티캐스트 알림 전송 성공:", response);
    //   })
    //   .catch((error) => {
    //     console.error("알림 전송 오류:", error);
    //   });

    // 모든 토큰에 메시지 전송
    // const response = await admin.messaging().sendToDevice(tokens, message);
    // const response = await admin.messaging().send(message);
    // return NextResponse.json({message: "알림 전송 성공", response});
  } catch (error) {
    console.error("알림 전송 에러:", error);
    return NextResponse.json({error: "알림 전송 실패"}, {status: 500});
  }
}
