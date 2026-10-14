/**
 * webSearchService.js — Live Web Search & Grounding Service for ABase AI.
 * Queries live web sources (Wikipedia, official docs, curated knowledge) without requiring paid API keys.
 */

// Curated official websites & documentation registry
const OFFICIAL_WEB_REGISTRY = {
    "react": {
        title: "React Official Website & Documentation",
        url: "https://react.dev",
        docs: "https://react.dev/learn",
        description: "The official library for web and native user interfaces."
    },
    "react native": {
        title: "React Native Official Documentation",
        url: "https://reactnative.dev",
        docs: "https://reactnative.dev/docs/getting-started",
        description: "Create native apps for Android, iOS, and more using React."
    },
    "expo": {
        title: "Expo Developer Documentation",
        url: "https://expo.dev",
        docs: "https://docs.expo.dev",
        description: "An open-source framework for building universal React Native apps."
    },
    "javascript": {
        title: "MDN Web Docs: JavaScript",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
        docs: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
        description: "Comprehensive documentation and standards for the JavaScript programming language."
    },
    "typescript": {
        title: "TypeScript Official Website",
        url: "https://www.typescriptlang.org",
        docs: "https://www.typescriptlang.org/docs/",
        description: "JavaScript with syntax for types."
    },
    "node": {
        title: "Node.js Official Documentation",
        url: "https://nodejs.org",
        docs: "https://nodejs.org/docs/latest/api/",
        description: "JavaScript runtime built on Chrome's V8 JavaScript engine."
    },
    "nodejs": {
        title: "Node.js Official Documentation",
        url: "https://nodejs.org",
        docs: "https://nodejs.org/docs/latest/api/",
        description: "JavaScript runtime built on Chrome's V8 JavaScript engine."
    },
    "python": {
        title: "Python Official Website & Docs",
        url: "https://www.python.org",
        docs: "https://docs.python.org/3/",
        description: "An easy-to-learn, powerful programming language."
    },
    "mongodb": {
        title: "MongoDB Documentation",
        url: "https://www.mongodb.com",
        docs: "https://www.mongodb.com/docs/",
        description: "The developer data platform with document database."
    },
    "express": {
        title: "Express.js Fast Web Framework",
        url: "https://expressjs.com",
        docs: "https://expressjs.com/en/starter/installing.html",
        description: "Fast, unopinionated, minimalist web framework for Node.js."
    },
    "pytorch": {
        title: "PyTorch Deep Learning Platform",
        url: "https://pytorch.org",
        docs: "https://pytorch.org/docs/stable/index.html",
        description: "An open source machine learning framework that accelerates path from research to deployment."
    },
    "docker": {
        title: "Docker Documentation",
        url: "https://www.docker.com",
        docs: "https://docs.docker.com",
        description: "Accelerate how you build, share, and run modern applications."
    },
    "git": {
        title: "Git Documentation & Reference",
        url: "https://git-scm.com",
        docs: "https://git-scm.com/doc",
        description: "Free and open source distributed version control system."
    },
    "github": {
        title: "GitHub Platform",
        url: "https://github.com",
        docs: "https://docs.github.com",
        description: "Where the world builds software."
    }
};

/**
 * Searches the web for the given topic and returns grounded summaries + real links.
 */
export async function searchLiveWeb(query) {
    const cleanQuery = query
        .replace(/^(search|web|link|links|find|about|website|what is|meaning of|definition of)\s+/gi, "")
        .replace(/\b(for|the|of|in|to)\b/gi, " ")
        .trim();

    const lowerQuery = cleanQuery.toLowerCase();
    const results = {
        query: cleanQuery || query,
        summary: "",
        sourceName: "Live Web & Authoritative Sources",
        links: []
    };

    // 1. Check curated official registry
    for (const [key, item] of Object.entries(OFFICIAL_WEB_REGISTRY)) {
        if (lowerQuery.includes(key)) {
            results.links.push({
                title: item.title,
                url: item.url,
                description: item.description
            });
            if (item.docs && item.docs !== item.url) {
                results.links.push({
                    title: `${item.title} (Docs)`,
                    url: item.docs,
                    description: `Official documentation and API reference for ${key}.`
                });
            }
        }
    }

    // 2. Query Wikipedia Full-Text Search
    try {
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanQuery || query)}&utf8=&format=json`;
        const searchRes = await fetch(searchUrl, {
            headers: { "User-Agent": "ABase-AI-Assistant/1.0" },
            signal: AbortSignal.timeout(4000)
        });

        if (searchRes.ok) {
            const searchData = await searchRes.json();
            const hits = searchData?.query?.search || [];

            if (hits.length > 0) {
                const topHit = hits[0];
                const topTitle = topHit.title;

                // Fetch page summary for the top hit
                try {
                    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topTitle.replace(/ /g, "_"))}`;
                    const sumRes = await fetch(summaryUrl, {
                        headers: { "User-Agent": "ABase-AI-Assistant/1.0" },
                        signal: AbortSignal.timeout(3000)
                    });

                    if (sumRes.ok) {
                        const sumData = await sumRes.json();
                        if (sumData.extract) {
                            results.summary = sumData.extract;
                        }
                        if (sumData.content_urls?.desktop?.page) {
                            results.links.unshift({
                                title: `Wikipedia: ${sumData.title}`,
                                url: sumData.content_urls.desktop.page,
                                description: sumData.description || `Encyclopedic article on ${sumData.title}.`
                            });
                        }
                    }
                } catch (e) {
                    // Fallback to hit snippet if summary failed
                    results.summary = topHit.snippet.replace(/<[^>]+>/g, "");
                }

                // Add secondary hit links
                for (let i = 1; i < Math.min(hits.length, 3); i++) {
                    const hit = hits[i];
                    const pageUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(hit.title.replace(/ /g, "_"))}`;
                    if (!results.links.some(l => l.url === pageUrl)) {
                        results.links.push({
                            title: `Wikipedia: ${hit.title}`,
                            url: pageUrl,
                            description: hit.snippet.replace(/<[^>]+>/g, "").slice(0, 100) + "..."
                        });
                    }
                }
            }
        }
    } catch (err) {
        console.warn("[webSearchService] Wikipedia search error:", err.message);
    }

    // 3. Fallback links if none found
    if (results.links.length === 0) {
        const encoded = encodeURIComponent(cleanQuery || query);
        results.links.push({
            title: `Search on Google: "${cleanQuery}"`,
            url: `https://www.google.com/search?q=${encoded}`,
            description: "Direct Google search results for this topic."
        });
        results.links.push({
            title: `Search on GitHub: "${cleanQuery}"`,
            url: `https://github.com/search?q=${encoded}`,
            description: "Find open-source repositories and code implementations."
        });
        results.links.push({
            title: `Search on DuckDuckGo: "${cleanQuery}"`,
            url: `https://duckduckgo.com/?q=${encoded}`,
            description: "Privacy-focused web search results."
        });
    }

    return results;
}
