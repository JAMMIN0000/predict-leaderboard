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

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").toLowerCase().trim();

  if (!q) {
    return Response.json({ results: [], message: "검색어를 입력해주세요" });
  }

  const data = getData();

  if (!data) {
    return Response.json({ results: [], message: "데이터가 아직 준비되지 않았습니다." });
  }

  const results = data.leaderboard.filter((entry) => {
    const name = (entry.name || "").toLowerCase();
    const addr = (entry.address || "").toLowerCase();
    return name.includes(q) || addr.includes(q);
  });

  return Response.json({
    results: results.slice(0, 20),
    scannedUsers: data.totalFetched,
    updatedAt: data.updatedAt,
  });
}
