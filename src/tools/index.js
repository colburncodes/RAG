const OpenAI = require("openai");
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

function getTimeOfDay() {
    return '5:35';
}

function getOrderStatus(orderId) {
    console.log(`Getting the status of order ${orderId}`);
    const orderNumber = parseInt(orderId);
    if (orderNumber % 2 === 0) {
        return 'IN_PROGRESS';
    }
    return 'COMPLETED'
}

async function callOpenAIWithTools() {
    const context = [{
        role: 'system',
        content: 'You are a helpful assistant that gives information about the time of day and order status'
    },{
        role: 'user',
        content: 'What is the status of order 12345?'
    }]
    // configure chat tools (first openAI call)
    const response = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: context,
        tools: [
            {
                type: 'function',
                function: {
                    name: 'getTimeOfDay',
                    description: 'Get the time of day'
                }
            },
            {
                type: 'function',
                function: {
                    name: 'getOrderStatus',
                    description: 'Get the order status',
                    parameters: {
                        type: 'object',
                        properties: {
                            orderId: {
                                type: 'string',
                                description: 'The order id of the order to get the status',
                            }
                        },
                        required: ['orderId'],
                    }
                }
            }
        ],
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

        if (toolName === 'getOrderStatus') {
            const rawArgument = toolCall.function.arguments;
            const parsedArguments = JSON.parse(rawArgument); // orderId
            const toolResp = getOrderStatus(parsedArguments.orderId);
            context.push(response.choices[0].message);
            context.push({
                role: 'tool',
                content: toolResp,
                tool_call_id: toolCall.id,
            })
        }
    }
    // make a second openAI call with tool response
    const secondResponse = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: context,
    });
    console.log(secondResponse.choices[0].message.content);
}

callOpenAIWithTools();


