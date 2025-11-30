import { getRepoMetadata } from "./github";

// Helper to fetch file content
async function fetchFileContent(owner, repo, path) {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        Accept: "application/vnd.github.v3.raw",
        // Add token if available
        ...(process.env.GITHUB_TOKEN && { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }),
      },
    });

    if (!response.ok) return null;
    return await response.text();
  } catch (error) {
    console.error(`Error fetching ${path}:`, error);
    return null;
  }
}

// Helper to fetch file tree (simplified)
async function fetchFileTree(owner, repo) {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`, {
        headers: {
            ...(process.env.GITHUB_TOKEN && { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }),
        }
    });
    
    // Try master if main fails
    if (!response.ok) {
         const masterResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`, {
            headers: {
                ...(process.env.GITHUB_TOKEN && { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }),
            }
        });
        if (!masterResponse.ok) return [];
        const data = await masterResponse.json();
        return data.tree || [];
    }

    const data = await response.json();
    return data.tree || [];
  } catch (error) {
    console.error("Error fetching tree:", error);
    return [];
  }
}

export async function generateRepoContext(repoUrl) {
  // getRepoMetadata is async, so we must await it
  const metadata = await getRepoMetadata(repoUrl);
  
  // The metadata object structure from lib/github.js is:
  // { name, full_name, owner: { login }, ... }
  // We need to extract owner login and repo name
  const owner = metadata.owner?.login;
  const repo = metadata.name;
  
  if (!owner || !repo) {
    throw new Error("Invalid GitHub URL");
  }

  // 1. Fetch File Tree
  const tree = await fetchFileTree(owner, repo);

  // 2. Identify Key Files
  // Priority: README, package.json/go.mod, source files (src/, app/, lib/, etc.)
  // Limit to ~20 important files to keep context manageable
  const importantFiles = tree.filter(file => {
    const path = file.path.toLowerCase();
    return (
      path === "readme.md" ||
      path === "package.json" ||
      path === "go.mod" ||
      path === "requirements.txt" ||
      path === "cargo.toml" ||
      path === "prisma/schema.prisma" ||
      path.startsWith("src/") ||
      path.startsWith("app/") ||
      path.startsWith("lib/") ||
      path.startsWith("components/")
    );
  }).slice(0, 20); // Hard limit for demo

  // 3. Fetch Content
  let context = `Repository: ${owner}/${repo}\n\n`;
  
  for (const file of importantFiles) {
    if (file.type === "blob") {
      const content = await fetchFileContent(owner, repo, file.path);
      if (content) {
        context += `--- FILE: ${file.path} ---\n${content.slice(0, 5000)}\n\n`; // Truncate large files
      }
    }
  }

  return context;
}
