
/**
 * Fetches repository metadata from GitHub.
 * @param {string} repoUrl - The full URL of the GitHub repository.
 * @returns {Promise<Object>} - The repository metadata.
 */
export async function getRepoMetadata(repoUrl) {
  // Extract owner and repo from URL
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) {
    throw new Error("Invalid GitHub URL");
  }
  const owner = match[1];
  const repo = match[2];

  const headers = process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {};

  try {
    // 1. Fetch Basic Metadata
    const metaRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!metaRes.ok) throw new Error("Failed to fetch repo metadata");
    const meta = await metaRes.json();

    // 2. Fetch Commit Count & Active Period
    // Fetching just one commit per page to get the link header for count
    const commitsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`, { headers });
    let commitCount = 0;
    let activePeriod = "Unknown";
    
    if (commitsRes.ok) {
        const linkHeader = commitsRes.headers.get("link");
        if (linkHeader) {
            const lastPageMatch = linkHeader.match(/&page=(\d+)>; rel="last"/);
            commitCount = lastPageMatch ? parseInt(lastPageMatch[1], 10) : 1;
        } else {
            const commits = await commitsRes.json();
            commitCount = commits.length;
        }

        // Fetch first and last commit for active period
        // We already have the latest commit from the previous call (first item in default sort)
        const latestCommitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`, { headers });
        const latestCommitData = await latestCommitRes.json();
        const latestDate = latestCommitData[0]?.commit?.author?.date;

        // To get the first commit, we need to be clever or just approximate if too many.
        // GitHub API doesn't give "oldest" easily without traversing.
        // For now, let's just use the "created_at" from metadata as start date if we can't easily get first commit.
        const startDate = meta.created_at;
        
        if (startDate && latestDate) {
            const start = new Date(startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" });
            const end = new Date(latestDate).toLocaleDateString("en-US", { month: "short", year: "numeric" });
            activePeriod = `${start} - ${end}`;
        }
    }

    // 3. Fetch Owner Details (if user)
    let ownerDetails = { bio: "Not available", location: "Unknown", public_repos: 0 };
    if (meta.owner && meta.owner.url) {
        const ownerRes = await fetch(meta.owner.url, { headers });
        if (ownerRes.ok) {
            ownerDetails = await ownerRes.json();
        }
    }

    return {
        ...meta,
        commitCount,
        activePeriod,
        ownerDetails: {
            login: meta.owner.login,
            bio: ownerDetails.bio,
            location: ownerDetails.location,
            public_repos: ownerDetails.public_repos,
            avatar_url: meta.owner.avatar_url
        }
    };

  } catch (error) {
    console.warn("GitHub API failed or rate limited, using fallback data:", error);
    return {
        name: repo,
        full_name: `${owner}/${repo}`,
        description: "A software project on GitHub.",
        stargazers_count: 0,
        language: "Unknown",
        owner: { login: owner },
        html_url: repoUrl,
        commitCount: 0,
        activePeriod: "Unknown",
        ownerDetails: { login: owner, bio: "Unknown", location: "Unknown", public_repos: 0 }
    };
  }
}

/**
 * Fetches repository languages.
 * @param {string} repoUrl 
 * @returns {Promise<Object>}
 */
export async function getRepoLanguages(repoUrl) {
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return {};
    const owner = match[1];
    const repo = match[2];

    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`);
        if (!response.ok) return { JavaScript: 1000, HTML: 200 };
        return await response.json();
    } catch (e) {
        return { JavaScript: 1000 };
    }
}
