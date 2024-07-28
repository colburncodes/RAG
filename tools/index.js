const OpenAI = require("openai");
const { encoding_for_model } = require('tiktoken')
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// configure chat tools (first openAI call)
// decide if tool call is required - based on the response above
// invoke the tool
// make a second openAI call with tool response
