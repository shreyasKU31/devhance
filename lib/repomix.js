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
  const metadata = await getRepoMetadata(repoUrl);
  const owner = metadata.owner?.login;
  const repo = metadata.name;
  
  if (!owner || !repo) {
    throw new Error("Invalid GitHub URL");
  }

  const tree = await fetchFileTree(owner, repo);

  // Priority files for minimal but meaningful context
  const priorityPatterns = [
    /^readme\.md$/i,
    /^package\.json$/,
    /^prisma\/schema\.prisma$/,
    /^(src|app|lib)\/[^/]+\.(js|ts|jsx|tsx)$/, // Only top-level source files
  ];

  const importantFiles = tree
    .filter(file => {
      if (file.type !== "blob") return false;
      const path = file.path.toLowerCase();
      return priorityPatterns.some(p => p.test(path));
    })
    .slice(0, 12); // Reduced from 20 to 12

  // Build compact context
  let context = `Repo: ${owner}/${repo}\n`;
  context += `Files: ${tree.filter(f => f.type === "blob").length}\n\n`;
  
  for (const file of importantFiles) {
    const content = await fetchFileContent(owner, repo, file.path);
    if (content) {
      // Reduced from 5000 to 2000 chars per file
      const truncated = content.length > 2000 
        ? content.slice(0, 2000) + "\n[truncated]" 
        : content;
      context += `--- ${file.path} ---\n${truncated}\n\n`;
    }
  }

  return context;
}
