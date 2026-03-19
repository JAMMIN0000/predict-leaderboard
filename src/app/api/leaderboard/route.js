import { readFileSync } from "fs";
import { join } from "path";

let cachedData = null;

function getData() {
  if (cachedData) return cachedData;
  try {
    const filePath = join(process.cwd(), "public", "data.json");
    cachedData = JSON.parse(readFileSync(filePath, "utf-8"));
    return cachedData;
  } catch {
    return null;
  }
}

export async function GET() {
  const data = getData();

  if (!data) {
    return Response.json({
      leaderboard: [],
      tierData: [],
      totalFetched: 0,
      updatedAt: null,
      message: "데이터가 아직 준비되지 않았습니다.",
    });
  }

  return Response.json({
    leaderboard: data.leaderboard.slice(0, 100),
    tierData: data.tierData,
    totalFetched: data.totalFetched,
    updatedAt: data.updatedAt,
  });
}
