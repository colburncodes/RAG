const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

const context = [{
    role: 'system',
    content: 'You are a helpful assistant that gives information about flights and makes reservations'
}]


function getListOfFlights(origin, destination) {
    console.log('Getting available flights.')
}

function setFlightReservation(code) {
    console.log('Confirming reservations.')
}

/**
 * This function demonstrates how to make an API call to OpenAI's chat completions
 * endpoint with function-calling capabilities. It sets up a conversation context
 * and defines two tools: one for getting a list of flights, and another for flight
 * reservations. The function allows the AI model to choose which tool to use based
 * on the conversation context.
 *
 * The function does the following:
 * 1. Sets up the initial conversation context with a system message and a user query.
 * 2. Configures two tools: getListOfFlight and setFlightReservation.
 * 3. Makes an API call to OpenAI with the context and tool definitions.
 * 4. Allows the AI to automatically choose which tool to use based on the context.
 *
 * Note: This function is asynchronous and requires the OpenAI API to be properly
 * configured and authenticated in the runtime environment.
 */
async function createCompletion() {
    const response = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: context,
        tools:[
            {
                type: 'function',
                function: {
                    name: 'getListOfFlights',
                    description: 'Get the list of available flights.',
                    parameters: {
                        type: 'object',
                        properties: {
                            origin: {
                                type: 'string',
                                description: 'departure of a flight.'
                            },
                            destination: {
                                type: 'string',
                                description: 'destination of a flight'
                            }
                        },
                        required: ['origin', 'destination'],
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'setFlightReservation',
                    description: 'Makes reservations for customer.',
                    parameters: {
                        type: 'object',
                        properties: {
                            code: {
                                type: 'string',
                                description: 'The code of the flight service',
                            }
                        }
                    }
                }
            }
        ]
    })
}