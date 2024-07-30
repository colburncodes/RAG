const OpenAI = require("openai");
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

function getTimeOfDay() {
    return '5:35';
}

async function callOpenAIWithTools() {
    const context = [{
        role: 'system',
        content: 'You are a helpful assistant?'
    },{
        role: 'user',
        content: 'What is the time of day?'
    }]
    // configure chat tools (first openAI call)
    const response = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: context,
        tools: [{
            type: 'function',
            function: {
                name: 'getTimeOfDay',
                description: 'Get the time of day'
            }
        }],
        tool_choice: 'auto' // the engine will decide which tool to use
    });
    // decide if tool call is required
    const toolReq = response.choices[0].finish_reason === "tool_calls";
    const toolCall = response.choices[0].message.tool_calls[0];

    if (toolReq) {
        const toolName = toolCall.function.name;
        if (toolName === 'getTimeOfDay') {
            const toolResp = getTimeOfDay();
            context.push(response.choices[0].message);
            context.push({
                role: 'tool',
                content: toolResp,
                tool_call_id: toolCall.id,
            })
        }
    }
    // make a second openAI call with tool response
}

callOpenAIWithTools();


