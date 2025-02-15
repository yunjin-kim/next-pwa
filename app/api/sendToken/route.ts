import {NextResponse} from "next/server";
import {supabase} from "../../lib/supabaseClient";
import {v4 as uuidv4} from "uuid";

export async function POST(request: Request) {
  try {
    const {token} = await request.json();

    if (!token) {
      return NextResponse.json(
        {error: "필수 파라미터가 누락되었습니다."},
        {status: 400}
      );
    }

    const {data, error} = await supabase
      .from("user_fcm_tokens") // 본인이 만든 테이블명
      .insert({
        user_id: uuidv4(), // id는 UUID로 생성
        fcm_token: token, // 컬럼명: 값
        created_at: new Date(),
        device_id: "...",
        device_type: "wev",
      })
      .select("*");

    if (error) {
      console.error("DB Insert Error:", error);
      return NextResponse.json({error: error.message}, {status: 500});
    }

    console.log("DB Insert Result:", data);

    return NextResponse.json({message: "토큰 저장 성공", token});
  } catch (error) {
    console.error("알림 전송 에러:", error);
    return NextResponse.json({error: "알림 전송 실패"}, {status: 500});
  }
}
