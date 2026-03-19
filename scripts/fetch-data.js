const fs = require("fs");
const path = require("path");

const GRAPHQL_URL = "https://graphql.predict.fun/graphql";

const QUERY = `
query GetLeaderboardData($pagination: ForwardPaginationInput) {
  leaderboard(pagination: $pagination) {
    edges {
      node {
        rank
        totalPoints
        allocationRoundPoints
        account {
          name
          address
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(url, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, options);
    if (res.ok) return res;
    console.log(`  Retry ${i + 1}/${retries} (status ${res.status})`);
    await sleep(2000 * (i + 1));
  }
  throw new Error(`Failed after ${retries} retries`);
}

async function fetchAllLeaderboard() {
  const all = [];
  let cursor = null;
  let page = 0;

  while (all.length < 10000) {
    page++;
    const variables = { pagination: { first: 100 } };
    if (cursor) variables.pagination.after = cursor;

    const res = await fetchWithRetry(GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: QUERY, variables }),
    });

    const data = await res.json();
    const edges = data.data.leaderboard.edges;
    const pageInfo = data.data.leaderboard.pageInfo;

    for (const edge of edges) {
      const n = edge.node;
      all.push({
        rank: n.rank,
        totalPoints: Math.round(n.totalPoints),
        allocationRoundPoints: Math.round(n.allocationRoundPoints),
        name: n.account.name,
        address: n.account.address,
      });
    }

    console.log(`Page ${page}: ${all.length} entries`);

    if (!pageInfo.hasNextPage || all.length >= 10000) break;
    cursor = pageInfo.endCursor;

    // 레이트 리밋 방지: 10페이지마다 1초 쉬기
    if (page % 10 === 0) await sleep(1000);
  }

  return all.slice(0, 10000);
}

async function main() {
  console.log("Fetching leaderboard data...");
  const leaderboard = await fetchAllLeaderboard();

  const cutoffs = [10, 50, 100, 200, 300, 500, 700, 1000, 1500, 2000, 3000, 5000, 7000, 10000];
  const tierData = cutoffs
    .filter((c) => c <= leaderboard.length)
    .map((c) => {
      const entry = leaderboard.find((d) => d.rank === c);
      return {
        rank: c,
        label: c >= 1000 ? c / 1000 + "K" : String(c),
        minPoints: entry ? entry.totalPoints : 0,
      };
    });

  const payload = {
    leaderboard,
    tierData,
    totalFetched: leaderboard.length,
    updatedAt: new Date().toISOString(),
  };

  const outPath = path.join(__dirname, "..", "public", "data.json");
  fs.writeFileSync(outPath, JSON.stringify(payload));
  console.log(`Done! ${leaderboard.length} entries saved to public/data.json (${(fs.statSync(outPath).size / 1024 / 1024).toFixed(1)}MB)`);
}

main().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
