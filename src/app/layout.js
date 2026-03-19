export const metadata = {
  title: "Predict.fun Leaderboard",
  description: "실시간 Predict.fun 리더보드 조회",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, fontFamily: "'Segoe UI', sans-serif", background: "#0a0a0f", color: "#e0e0e0" }}>
        {children}
      </body>
    </html>
  );
}
