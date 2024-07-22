require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function main() {
    const completion = await openai.chat.completions.create({
        messages: [{ role: "assistant", content: "Hello, how can I assist you today? Yep!" }],
        model: "gpt-4-turbo",
    });

    console.log(completion.choices[0]);
}

main();