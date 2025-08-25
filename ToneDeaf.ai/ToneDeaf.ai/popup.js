document.addEventListener("DOMContentLoaded", () => {
  const sarcasmModeSelect = document.getElementById("sarcasm-mode");
  const input = document.getElementById("input");
  const output = document.getElementById("output");
  const sarcasmifyBtn = document.getElementById("sarcasmify");

  // Load last selected mode
  chrome.storage.sync.get("sarcasmMode", (data) => {
    if (data.sarcasmMode) {
      sarcasmModeSelect.value = data.sarcasmMode;
    }
  });

  // Save selected mode
  sarcasmModeSelect.addEventListener("change", () => {
    chrome.storage.sync.set({ sarcasmMode: sarcasmModeSelect.value });
  });

  // When user clicks Sarcasmify
  sarcasmifyBtn.addEventListener("click", async () => {
    const mode = sarcasmModeSelect.value;
    const userText = input.value.trim();

    if (!userText) {
      output.textContent = "⚠ Say something first… I can’t roast silence.";
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/sarcasm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userText, mode: mode }),
      });

      const data = await response.json();
      output.textContent = data.reply || "⚠ Error generating sarcasm.";
    } catch (err) {
      output.textContent = "⚠ Server error, is app.py running?";
    }
  });
});
