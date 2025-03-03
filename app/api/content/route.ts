import {NextResponse} from "next/server";

const contentData: {id: number; content: string}[] = [];

export async function POST(request: Request) {
  try {
    const data = await request.json();

    console.log("컨텐츠 저장 요청:", data);

    contentData.push(data);

    return NextResponse.json({message: "컨텐츠 저장 성공"});
  } catch (error) {
    console.error("컨텐츠 저장 에러:", error);
    return NextResponse.json({error: "컨텐츠 전송 실패"}, {status: 500});
  }
}

export async function GET() {
  try {
    return NextResponse.json({message: "컨텐츠 저장 성공", data: contentData});
  } catch (error) {
    console.error("컨텐츠 전송 에러:", error);
    return NextResponse.json({error: "컨텐츠 전송 실패"}, {status: 500});
  }
}
