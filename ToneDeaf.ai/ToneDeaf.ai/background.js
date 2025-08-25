async function sarcastify(text) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get("openaiKey", async (data) => {
            const apiKey = data.openaiKey;
            if (!apiKey) {
                reject("No API key set. Please save one in options.");
                return;
            }

            try {
                const response = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: "gpt-4o-mini",
                        messages: [
                            { "role": "system", "content": "Rewrite everything sarcastically in corporate passive-aggressive tone." },
                            { "role": "user", "content": text }
                        ],
                        temperature: 0.9
                    })
                });

                const data = await response.json();
                resolve(data.choices[0].message.content.trim());
            } catch (err) {
                reject(err);
            }
        });
    });
}

// Listen for requests from content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "sarcastify") {
        sarcastify(request.text)
            .then((result) => sendResponse({ result }))
            .catch((err) => sendResponse({ error: err.toString() }));
        return true; // keeps message channel open for async
    }
});
