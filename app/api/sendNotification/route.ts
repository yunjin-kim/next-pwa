// app/api/sendNotification/route.ts
import {NextResponse} from "next/server";
import admin from "firebase-admin";
import {getMessaging} from "firebase-admin/messaging";
import {supabase} from "../../lib/supabaseClient";

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

    const {data, error} = await supabase
      .from("user_fcm_tokens") // 본인이 만든 테이블 이름
      .select("fcm_token");

    if (error) {
      console.error("DB 조회 오류:", error);
      return NextResponse.json({error: error.message}, {status: 500});
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        {error: "등록된 토큰이 없습니다."},
        {status: 400}
      );
    }

    // 2) 가져온 데이터에서 토큰 배열 추출
    const tokens = data.map((row) => row.fcm_token);

    console.log("토큰 목록:", tokens);

    const message = {
      data: {
        title,
        body,
      },
      tokens,
    };

    const response = await getMessaging().sendEachForMulticast(message);
    // await getMessaging().send(message);
    console.log("멀티캐스트 알림 전송 성공:", response);

    return NextResponse.json({message: "알림 전송 성공", response});
  } catch (error) {
    console.error("알림 전송 에러:", error);
    return NextResponse.json({error: "알림 전송 실패"}, {status: 500});
  }
}
