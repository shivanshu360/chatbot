let prompt = document.querySelector("#prompt")
let submitbtn = document.querySelector("#submit")
let chatContainer = document.querySelector(".chat-container")
let imagebtn = document.querySelector("#image")
let image = document.querySelector("#image img")
let imageinput = document.querySelector("#image input")

// IMPORTANT: Paste your BRAND NEW API key here! The old one is compromised.

const Api_Url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`;

let user = {
    message: null,
    file: {
        mime_type: null,
        data: null
    }
}

// 1. ADDED THIS LOCK VARIABLE
let isGenerating = false; 

async function generateResponse(aiChatBox) {
    let text = aiChatBox.querySelector(".ai-chat-area")

    const apiParts = [];
    if (user.message) {
        apiParts.push({ text: user.message });
    } else if (user.file && user.file.data) {
        apiParts.push({ text: "Describe this image in detail" });
    }

    if (user.file && user.file.data) {
        apiParts.push({ inline_data: user.file });
    }

    let RequestOption = {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "contents": [{
                "parts": apiParts
            }]
        })
    }

    try {
        let response = await fetch(Api_Url, RequestOption)
        let data = await response.json()
        
        if (!response.ok) {
            throw new Error(`API Error: ${data.error?.message || response.statusText}`);
        }

        if (data.candidates[0].finishReason === 'SAFETY' || !data.candidates[0].content) {
            text.innerHTML = "Error: The API blocked this request. Gemini usually rejects images of personal information or government IDs."
            text.style.color = "#ff6b6b"
            return;
        }

        let apiResponse = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim()
        text.innerHTML = apiResponse
        text.style.color = "" 
    }
    catch (error) {
        console.error("Fetch error details:", error);
        text.innerHTML = "Error: " + error.message;
        text.style.color = "#ff6b6b" 
    }
    finally {
        chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" })
        image.src = `img.svg`
        image.classList.remove("choose")
        imageinput.value = ""
        user.file = { mime_type: null, data: null } 
        
        // 2. UNLOCK WHEN FINISHED
        isGenerating = false; 
    }
}

function createChatBox(html, classes) {
    let div = document.createElement("div")
    div.innerHTML = html
    div.classList.add(classes)
    return div
}

function handlechatResponse(userMessage) {
    if (!userMessage.trim() && !user.file.data) return; 
    
    // 3. CHECK THE LOCK. If we are already generating, ignore the click/enter
    if (isGenerating) return; 
    
    // Lock it down
    isGenerating = true; 

    user.message = userMessage
    let html = `<img src="user.png" alt="" id="userImage" width="8%">
<div class="user-chat-area">
${user.message}
${user.file.data ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg" />` : ""}
</div>`
    prompt.value = ""
    let userChatBox = createChatBox(html, "user-chat-box")
    chatContainer.appendChild(userChatBox)

    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" })

    setTimeout(() => {
        let html = `<img src="ai.png" alt="" id="aiImage" width="10%">
    <div class="ai-chat-area">
    <img src="loading.webp" alt="" class="load" width="50px">
    </div>`
        let aiChatBox = createChatBox(html, "ai-chat-box")
        chatContainer.appendChild(aiChatBox)
        generateResponse(aiChatBox)

    }, 600)
}

prompt.addEventListener("keydown", (e) => {
    // 4. Added !e.shiftKey so users can use Shift+Enter to create new lines
    if (e.key == "Enter" && !e.shiftKey) { 
        e.preventDefault(); // Stop default browser behavior
        handlechatResponse(prompt.value)
    }
})

submitbtn.addEventListener("click", () => {
    handlechatResponse(prompt.value)
})

imageinput.addEventListener("change", () => {
    const file = imageinput.files[0]
    if (!file) return
    let reader = new FileReader()
    reader.onload = (e) => {
        let base64string = e.target.result.split(",")[1]
        user.file = {
            mime_type: file.type,
            data: base64string
        }
        image.src = `data:${user.file.mime_type};base64,${user.file.data}`
        image.classList.add("choose")
    }

    reader.readAsDataURL(file)
})

imagebtn.addEventListener("click", (e) => {
    if (e.target !== imageinput) {
        imageinput.click()
    }
})