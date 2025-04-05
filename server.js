const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const MODEL = "gemini-2.0-pro-exp-02-05";
const API_KEY = "AIzaSyD4QqgiXx2yNMy1fkFQEw_egdR_3kKJak0";

const ai = new GoogleGenerativeAI(API_KEY);
const model = ai.getGenerativeModel({ model: MODEL });

const app = express();

// Serve static files (CSS, JS, HTML)
app.use(express.static(__dirname));

// Serve index.html on root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

const MEMORY_FILE = './memory.json';
const PROMPT_FILE = './jarvis_prompt.txt';
const MAX_MEMORY = 10;

// Load custom Jarvis brain/personality
function loadJarvisPrompt() {
  try {
    return fs.readFileSync(PROMPT_FILE, 'utf8');
  } catch (error) {
    console.warn('Could not load Jarvis prompt file.');
    return '';
  }
}

// Load previous memory
function loadMemory() {
  try {
    const data = fs.readFileSync(MEMORY_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.warn("Memory file not found. Starting with fresh memory.");
    return [];
  }
}

// Save memory to file
function saveMemory(memory) {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory.slice(-MAX_MEMORY), null, 2));
}

// Main endpoint
app.post('/response', async (req, res) => {
  try {
    const userMessage = req.body.message;
    console.log('Mr. Stark:', userMessage);

    const systemPrompt = loadJarvisPrompt();
    let memory = loadMemory();

    // Add new message to memory
    memory.push(`Mr. Stark: ${userMessage}`);

    // Construct prompt with memory + custom Jarvis prompt
    const prompt = `
${systemPrompt}

## Memory Log:
${memory.join("\n")}

Jarvis:
`;

    // Generate AI response
    const { response } = await model.generateContent(prompt);
    const aiResponse = response.text().trim();
    console.log('Jarvis:', aiResponse);

    // Save response to memory
    memory.push(`Jarvis: ${aiResponse}`);
    saveMemory(memory);

    res.json({ response: aiResponse });
  } catch (error) {
    console.error('Jarvis malfunction:', error);
    res.status(500).json({ error: "Jarvis encountered a malfunction. Please retry, Mr. Stark." });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Jarvis online and operational on port ${port}, Mr. Stark.`);
});
