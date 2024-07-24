//https://js.langchain.com/v0.2/docs/concepts/#chat-models
require('dotenv').config();
const cors = require('cors');
const express = require('express');
const { ChatOpenAI } = require('@langchain/openai');
const { ChatPromptTemplate } = require('@langchain/core/prompts');

const app = new express();
app.use(express.json());
// app.use(express.static('.'));
app.use(cors({
    origin: '*',
}));

const PORT = process.env.PORT || 63342;
async function main() {
    const model = new ChatOpenAI({
        model: "gpt-4-turbo",
        temperature: 0,
        maxTokens: 1000,
        verbose: true,
    });

    const prompt = ChatPromptTemplate.fromTemplate('Tell me a joke about {input}');
    const chain = prompt.pipe(model);

    app.post(`/chat`, async (req, res) => {
        try {
            const { message } = req.body;
            const response = await chain.invoke({ input: message });
            res.json({ response: response.content });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'An error occurred' });
        }
    });
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

main()



