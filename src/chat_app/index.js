const OpenAI = require("openai");
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

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
    context.push({
        role: "assistant",
        content: responseMessage.content
    })
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