"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [tierData, setTierData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchInfo, setSearchInfo] = useState("");

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((data) => {
        setLeaderboard(data.leaderboard || []);
        setTierData(data.tierData || []);
        setUpdatedAt(data.updatedAt || "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchResults(null);
    setSearchInfo("");
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      setSearchResults(data.results || []);
      setSearchInfo(`${(data.scannedUsers || 0).toLocaleString()}명 스캔 완료`);
    } catch {
      setSearchInfo("검색 중 오류가 발생했습니다");
    }
    setSearching(false);
  };

  const s = {
    card: { background: "#14141f", borderRadius: 16, padding: 24, marginBottom: 24, border: "1px solid #1e1e2e" },
    th: { padding: "12px 12px", textAlign: "left", fontSize: 13, color: "#f59e0b", borderBottom: "2px solid #f59e0b", whiteSpace: "nowrap" },
    td: { padding: "12px 12px", borderBottom: "1px solid #1a1a2a" },
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", padding: "40px 0 20px" }}>
        <img src="/mascot.png" alt="mascot" style={{ width: 100, height: 100, marginBottom: 12 }} />
        <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, background: "linear-gradient(135deg, #f59e0b, #ef4444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Predict.fun Leaderboard
        </h1>
        <p style={{ color: "#666", marginTop: 8, fontSize: 14 }}>매 시간 자동 업데이트 · 즉시 로딩</p>
        {updatedAt && <p style={{ color: "#444", fontSize: 11 }}>Updated: {new Date(updatedAt).toLocaleString("ko-KR")}</p>}
      </div>

      {/* Search */}
      <div style={s.card}>
        <h2 style={{ fontSize: 18, marginTop: 0, marginBottom: 6 }}>내 순위 조회</h2>
        <p style={{ color: "#666", fontSize: 13, marginBottom: 14 }}>이름 또는 지갑 주소로 검색 (상위 10,000명)</p>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="이름 또는 0x 주소 입력..."
            style={{ flex: 1, padding: "12px 16px", borderRadius: 10, border: "1px solid #2a2a3a", background: "#0a0a15", color: "#fff", fontSize: 14, outline: "none" }}
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            style={{ padding: "12px 24px", borderRadius: 10, border: "none", background: searching ? "#333" : "#f59e0b", color: "#000", fontWeight: 700, fontSize: 14, cursor: searching ? "wait" : "pointer" }}
          >
            {searching ? "검색 중..." : "조회"}
          </button>
        </div>

        {searching && (
          <div style={{ textAlign: "center", padding: 20, color: "#f59e0b", fontSize: 14 }}>
            검색 중...
          </div>
        )}

        {searchResults !== null && !searching && (
          <div style={{ marginTop: 16 }}>
            {searchInfo && <p style={{ color: "#666", fontSize: 12, marginBottom: 8 }}>{searchInfo}</p>}
            {searchResults.length === 0 ? (
              <p style={{ color: "#ef4444", padding: 8, fontSize: 14 }}>검색 결과 없음 (상위 10,000명 이내에 없을 수 있습니다)</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={s.th}>순위</th>
                      <th style={s.th}>이름</th>
                      <th style={s.th}>주소</th>
                      <th style={{ ...s.th, textAlign: "right" }}>총 포인트</th>
                      <th style={{ ...s.th, textAlign: "right" }}>라운드 포인트</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((r) => (
                      <tr key={r.rank} style={{ background: "#0f0f1a" }}>
                        <td style={{ ...s.td, fontWeight: 700, fontSize: 16, color: "#f59e0b" }}>#{r.rank}</td>
                        <td style={{ ...s.td, fontWeight: 600 }}>{r.name || "-"}</td>
                        <td style={{ ...s.td, fontSize: 11, color: "#888", fontFamily: "monospace", wordBreak: "break-all" }}>{r.address}</td>
                        <td style={{ ...s.td, textAlign: "right", fontWeight: 600 }}>{r.totalPoints.toLocaleString()}</td>
                        <td style={{ ...s.td, textAlign: "right" }}>{r.allocationRoundPoints.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#666" }}>리더보드 로딩 중...</div>
      ) : (
        <>
          {/* Tier Cutoffs Table */}
          <div style={s.card}>
            <h2 style={{ fontSize: 18, marginTop: 0, marginBottom: 6 }}>등수별 포인트 컷</h2>
            <p style={{ color: "#666", fontSize: 13, marginBottom: 14 }}>각 구간 진입에 필요한 최소 포인트</p>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={s.th}>구간</th>
                    <th style={{ ...s.th, textAlign: "right" }}>최소 포인트</th>
                  </tr>
                </thead>
                <tbody>
                  {tierData.map((t, i) => (
                    <tr key={t.rank} style={{ background: i % 2 === 0 ? "#0f0f1a" : "transparent" }}>
                      <td style={{ ...s.td, fontWeight: 700, color: t.rank <= 100 ? "#f59e0b" : t.rank <= 1000 ? "#8b5cf6" : "#3b82f6" }}>
                        Top {t.label}
                      </td>
                      <td style={{ ...s.td, textAlign: "right", fontWeight: 600, fontFamily: "monospace", fontSize: 15 }}>
                        {t.minPoints.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top 100 Table */}
          <div style={s.card}>
            <h2 style={{ fontSize: 18, marginTop: 0, marginBottom: 14 }}>Top 100</h2>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={s.th}>#</th>
                    <th style={s.th}>이름</th>
                    <th style={s.th}>주소</th>
                    <th style={{ ...s.th, textAlign: "right" }}>총 포인트</th>
                    <th style={{ ...s.th, textAlign: "right" }}>라운드 포인트</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((r, i) => (
                    <tr key={r.rank} style={{ background: i % 2 === 0 ? "#0f0f1a" : "transparent" }}>
                      <td style={{ ...s.td, fontWeight: 700, color: i === 0 ? "#ffd700" : i === 1 ? "#c0c0c0" : i === 2 ? "#cd7f32" : "#e0e0e0" }}>
                        {r.rank}
                      </td>
                      <td style={{ ...s.td, fontWeight: 600 }}>{r.name || "-"}</td>
                      <td style={{ ...s.td, fontSize: 11, color: "#888", fontFamily: "monospace", wordBreak: "break-all" }}>{r.address}</td>
                      <td style={{ ...s.td, textAlign: "right", fontWeight: 600, fontFamily: "monospace" }}>{r.totalPoints.toLocaleString()}</td>
                      <td style={{ ...s.td, textAlign: "right", fontFamily: "monospace", color: "#999" }}>{r.allocationRoundPoints.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <footer style={{ textAlign: "center", padding: "20px 0", color: "#333", fontSize: 11 }}>
        predict.fun GraphQL API · 실시간
      </footer>
    </div>
  );
}
