document.getElementById("saveKey").addEventListener("click", () => {
    const key = document.getElementById("apiKey").value;
    chrome.storage.sync.set({ openaiKey: key }, () => {
        alert("API Key saved!");
    });
});
