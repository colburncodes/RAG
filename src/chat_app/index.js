const OpenAI = require("openai");
const { encoding_for_model } = require('tiktoken')
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
const encoder = encoding_for_model('gpt-4-turbo');

const MAX_TOKENS = 700;

const context = [{
    role: "assistant",
    content: 'You are a helpful chatbot'
}];

async function createCompletion() {
    const response = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: context
    });
    const responseMessage = response.choices[0].message;
    context.push(responseMessage)
    if (response.usage && response.usage.total_tokens > MAX_TOKENS) {
        deleteOldMessages();
    }
    console.log(`${response.choices[0].message.role}: ${response.choices[0].message.content}`);
}

process.stdin.addListener('data', async function (input) {
    const userInput = input.toString().trim();
    context.push({
        role: "user",
        content: userInput
    });

    await createCompletion();
})

function deleteOldMessages() {
    let contextLength = getContextLength();
    while (context.length > MAX_TOKENS) {
        for (let i=0; i < context.length; i++) {
            const message = context[i];
            if (message.role !== 'system') {
                context.split(i, 1);
                contextLength = getContextLength();
                console.log('New context length: ' + contextLength);
                break;
            }
        }
    }
}

function getContextLength() {
    let length = 0;
    context.forEach((message) => {
        if (typeof message.content === "string") {
            length += encoder.encode(message.content).length;
        } else if (Array.isArray(message.content)) {
            message.content.forEach((messageContent) => {
                if (messageContent.type === 'text') {
                    length += encoder.encode(messageContent.text).length;
                }
            })
        }
    })
    return length;
}