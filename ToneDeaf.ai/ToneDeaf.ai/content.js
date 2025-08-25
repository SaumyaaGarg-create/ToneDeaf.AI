// Initial setup - get the sarcasm mode from storage
let currentSarcasmMode = 'corporate'; // Default mode

chrome.storage.sync.get('sarcasmMode', (data) => {
  if (data.sarcasmMode) {
    currentSarcasmMode = data.sarcasmMode;
    console.log('Loaded sarcasm mode:', currentSarcasmMode);
  }
});

// Listen for changes to the sarcasm mode
chrome.storage.onChanged.addListener((changes) => {
  if (changes.sarcasmMode) {
    currentSarcasmMode = changes.sarcasmMode.newValue;
    console.log('Sarcasm mode updated:', currentSarcasmMode);
  }
});

// Rules for transforming text based on triggers
const sarcasmRules = {
  corporate: [
    { 
      trigger: "follow", 
      response: "I'll be RELENTLESSLY hounding you with 17 status request emails while pretending they're 'just friendly check-ins'"
    },
    { 
      trigger: "report", 
      response: "I'm desperately awaiting your TPS reports which I will promptly ignore but still criticize in excruciating detail during our next team meeting"
    },
    { 
      trigger: "send", 
      response: "I demand immediate digital transference of documents that I'll let sit unread in my inbox for the next 3-5 business years"
    },
    { 
      trigger: "asap", 
      response: "I'm going to need this completed with URGENT IMMEDIACY despite planning this deliverable six months ago and only telling you about it now"
    },
    { 
      trigger: "thank you", 
      response: "I'm acknowledging your herculean effort with the bare minimum of recognition while simultaneously assigning you three more equally impossible tasks"
    },
    { 
      trigger: "sorry", 
      response: "I'm offering an empty apology that absolves me of responsibility while subtly implying this was actually your fault"
    },
    { 
      trigger: "quick question", 
      response: "I'm about to ask you something that will consume your entire afternoon and require a 27-slide PowerPoint to answer properly"
    },
    { 
      trigger: "per my last email", 
      response: "I'm professionally reminding you that I ALREADY TOLD YOU THIS, YOU ABSOLUTE WALNUT"
    },
    { 
      trigger: "circle back", 
      response: "I'm temporarily abandoning this conversation until I can ambush you with it again at the most inconvenient time possible"
    },
    {
      trigger: "when you have a moment", 
      response: "I'm pretending this isn't urgent while simultaneously expecting you to drop everything and prioritize my request immediately"
    },
    {
      trigger: "regards", 
      response: "I'm concluding this demand with a meaningless pleasantry that in no way reflects my true feelings about your work ethic"
    },
    {
      trigger: "intern", 
      response: "As someone performing skilled labor for almost no compensation, I expect you to handle this task with the expertise of a 20-year industry veteran"
    }
  ],
  
  passiveAggressive: [
    { 
      trigger: "thanks", 
      response: "Thanks SOOOOO much for finally doing the bare minimum that was expected of you"
    },
    { 
      trigger: "okay", 
      response: "Fine. Whatever. It's not like my opinion matters anyway."
    },
    { 
      trigger: "no problem", 
      response: "Oh sure, no problem at all! It's not like I had anything better to do with my precious time on this earth."
    },
    { 
      trigger: "sorry", 
      response: "I'm SOOOO sorry that you feel I've somehow wronged you in your perfect little world"
    },
    { 
      trigger: "good job", 
      response: "Wow, you actually did something correctly for once. Should we throw a parade?"
    },
    { 
      trigger: "just saying", 
      response: "I'm not trying to be rude, but actually I am totally trying to be rude while maintaining plausible deniability"
    }
  ],
  
  redditPedant: [
    { 
      trigger: "i think", 
      response: "Well, ACKCHYUALLY, as someone who once read half a Wikipedia article on this subject..."
    },
    { 
      trigger: "probably", 
      response: "SOURCE??? I'm going to need peer-reviewed evidence for that WILDLY speculative claim"
    },
    { 
      trigger: "their", 
      response: "*they're (I've contributed nothing of value to this conversation but correcting your grammar makes me feel intellectually superior)"
    },
    { 
      trigger: "always", 
      response: "That's a logical fallacy. Not ALWAYS. I once experienced an exception to this in 2016, which completely invalidates your entire argument"
    },
    { 
      trigger: "best", 
      response: "Oh sweet summer child... 'best' is subjective and therefore your opinion is objectively wrong. Let me explain in excruciating detail why MY preference is superior"
    },
    { 
      trigger: "edit:", 
      response: "EDIT: Thanks for the gold, kind stranger! EDIT 2: Wow, this blew up! EDIT 3: RIP my inbox EDIT 4: For those asking, yes I'm available for podcast appearances"
    }
  ]
};

// Generic fallback responses when no trigger is matched
const genericResponses = {
  corporate: [
    "Per our discussion, I'm synergistically leveraging your content to optimize stakeholder expectations moving forward.",
    "I'm taking the liberty of pivoting your messaging to better align with our core competencies and value-added propositions.",
    "Let me action this language to ensure we're all rowing in the same direction vis-à-vis our strategic communications framework.",
    "I've streamlined your verbiage to create a more robust and scalable narrative that drives bottom-line results.",
    "Your message has been rightsize-optimized to deliver enhanced engagement metrics across all vertical channels."
  ],
  passiveAggressive: [
    "I've taken the liberty of rewriting your text since you OBVIOUSLY needed the help.",
    "No offense, but your original text needed... improvements. Hope you don't mind! :)",
    "I fixed your message for you. Don't worry, not everyone can write perfectly the first time!",
    "I slightly adjusted your wording. It was almost good before, just needed a little help!",
    "I made some tiny changes that make your message sound like it was written by someone who actually cares."
  ],
  redditPedant: [
    "I've corrected your post to be technically accurate, which is the best kind of accurate.",
    "Fixed your comment. The flawed reasoning and grammatical errors were physically painful to read.",
    "Your original statement contained several factual inaccuracies which I've taken the liberty of rectifying.",
    "As a 15-year veteran of this topic with over 100,000 karma in related subreddits, I've adjusted your text to be correct.",
    "I've modified your text to remove the logical fallacies that were undermining your otherwise almost-coherent argument."
  ]
};

// Main function to transform text based on selected mode
function makeItSarcastic(text, mode) {
  const lowerText = text.toLowerCase();
  const modeMapping = {
    'corporate': 'corporate',
    'passive-aggressive': 'passiveAggressive',
    'reddit-pedant': 'redditPedant'
  };
  
  const ruleSet = mode in modeMapping ? sarcasmRules[modeMapping[mode]] : sarcasmRules.corporate;
  const genericSet = mode in modeMapping ? genericResponses[modeMapping[mode]] : genericResponses.corporate;
  
  // Check for trigger matches - score based approach to find best match
  let bestMatch = null;
  let bestScore = 0;
  
  for (const rule of ruleSet) {
    // Check for exact matches first
    if (lowerText.includes(rule.trigger)) {
      // Calculate a score based on how significant the match is relative to the text
      const matchScore = rule.trigger.length / lowerText.length;
      if (matchScore > bestScore) {
        bestScore = matchScore;
        bestMatch = rule;
      }
    }
  }
  
  // If we found a good match, use it
  if (bestMatch) {
    return bestMatch.response;
  }
  
  // Fallback to generic sarcasm
  return genericSet[Math.floor(Math.random() * genericSet.length)];
}

// Function to create and inject the ToneDeaf button
function injectToneDeafButton(textArea) {
  // Check if button already exists for this text area
  const existingButton = textArea.parentNode.querySelector('.tonedeaf-button');
  if (existingButton) return;
  
  // Create button element
  const button = document.createElement('button');
  button.textContent = '🤖 Enhance Tone';
  button.className = 'tonedeaf-button';
  
  // Position the button next to the text area
  //button.style.position = 'relative';
  // Style the button so it sticks to the bottom-right of the compose box
button.style.position = "absolute";
button.style.right = "10px";
button.style.bottom = "10px";
button.style.zIndex = "9999";
button.style.padding = "6px 10px";
button.style.background = "#f4f4f4";
button.style.border = "1px solid #ccc";
button.style.borderRadius = "6px";
button.style.cursor = "pointer";

  
  // Attach click handler to the button
  button.addEventListener('click', () => {
    // Get text from the text area
    let originalText = '';
    
    if (textArea.tagName.toLowerCase() === 'textarea' || 
        textArea.tagName.toLowerCase() === 'input') {
      originalText = textArea.value;
    } else {
      originalText = textArea.textContent || textArea.innerText;
    }
    
    // Transform the text
    const sarcasmText = makeItSarcastic(originalText, currentSarcasmMode);
    console.log("Original text:", originalText);
    console.log("Transformed text:", sarcasmText);
    console.log("Current mode:", currentSarcasmMode);
    
    // Replace the text in the text area
    if (textArea.tagName.toLowerCase() === 'textarea' || 
        textArea.tagName.toLowerCase() === 'input') {
      textArea.value = sarcasmText;
      // Trigger input event to activate any listeners on the textarea
      textArea.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      textArea.textContent = sarcasmText;
    }
  });
  
  // Insert button after the text area
  textArea.parentNode.insertBefore(button, textArea.nextSibling);
}

// Function to find text areas on the page
function findTextAreas() {
  // Common selectors for text areas on popular websites
  const selectors = [
    'textarea',
    'div[contenteditable="true"]',
    'div[role="textbox"]',
    'div[aria-label="Tweet text"]',
    'div[aria-label="Message Body"]',
    'div[aria-label="Add a comment…"]',
    'div.public-DraftEditor-content',
    'div.notranslate[contenteditable="true"]'
  ];
  
  // Find all matching elements
  const allTextAreas = [];
  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => allTextAreas.push(el));
  });
  
  // Inject button next to each text area
  allTextAreas.forEach(textArea => {
    injectToneDeafButton(textArea);
  });
  
  return allTextAreas.length > 0;
}

// Initial scan for text areas
let foundTextAreas = findTextAreas();

// Setup MutationObserver to detect dynamically added text areas
const observer = new MutationObserver((mutations) => {
  // Wait a bit for the DOM to settle
  setTimeout(() => {
    findTextAreas();
  }, 500);
});

// Start observing the document with the configured parameters
observer.observe(document.body, { 
  childList: true,
  subtree: true 
});

// Periodically check for new text areas (for sites that don't trigger mutations)
const checkInterval = setInterval(() => {
  if (findTextAreas()) {
    // If text areas were found, we don't need to keep checking as frequently
    clearInterval(checkInterval);
    
    // Setup a less frequent check for new text areas
    setInterval(findTextAreas, 3000);
  }
}, 1000);




function transformText(inputText, callback) {
    chrome.runtime.sendMessage({ action: "sarcastify", text: inputText }, (response) => {
        if (response.error) {
            console.error(response.error);
            callback(inputText); // fallback to original
        } else {
            callback(response.result);
        }
    });
}

// Example: replace all inputs on page
document.addEventListener("input", (e) => {
    if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") {
        transformText(e.target.value, (newText) => {
            e.target.value = newText;
        });
    }
});


