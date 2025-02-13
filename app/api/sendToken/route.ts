import {NextResponse} from "next/server";

export const tokenStorage = new Map<string, string>();

export async function POST(request: Request) {
  try {
    const {token} = await request.json();

    if (!token) {
      return NextResponse.json(
        {error: "필수 파라미터가 누락되었습니다."},
        {status: 400}
      );
    }

    tokenStorage.set(token, token);

    return NextResponse.json({message: "토큰 저장 성공", token});
  } catch (error) {
    console.error("알림 전송 에러:", error);
    return NextResponse.json({error: "알림 전송 실패"}, {status: 500});
  }
}
