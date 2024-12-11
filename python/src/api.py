from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List
import asyncio
import os
import instructor
import openai
from pydantic import Field, BaseModel
from atomic_agents.lib.components.system_prompt_generator import SystemPromptGenerator
from atomic_agents.lib.components.agent_memory import AgentMemory
from atomic_agents.agents.base_agent import (
    BaseAgent,
    BaseAgentConfig,
    BaseAgentInputSchema,
)
from atomic_agents.lib.base.base_io_schema import BaseIOSchema

app = FastAPI()

# Store active WebSocket connections
active_connections: List[WebSocket] = []

# API Key setup
API_KEY = "dummy-key"
if not API_KEY:
    API_KEY = os.getenv("***REMOVED***")

if not API_KEY:
    raise ValueError("API key is not set")


class CustomOutputSchema(BaseIOSchema):
    """Schema for chat responses including the message content and suggested follow-up questions."""

    chat_message: str = Field(
        ...,
        description="The chat message exchanged between the user and the chat agent.",
    )
    suggested_user_questions: List[str] = Field(
        ...,
        description="A list of suggested follow-up questions the user could ask the agent.",
    )


def create_agent():
    """Creates and configures a new agent instance with memory and system prompt."""
    # Initialize OpenAI client with instructor
    client = instructor.from_openai(openai.AsyncOpenAI(api_key=API_KEY))

    # Setup system prompt generator
    system_prompt_generator = SystemPromptGenerator(
        background=[
            "This assistant is a knowledgeable AI designed to be helpful, friendly, and informative.",
            "It has a wide range of knowledge on various topics and can engage in diverse conversations.",
        ],
        steps=[
            "Analyze the user's input to understand the context and intent.",
            "Formulate a relevant and informative response based on the assistant's knowledge.",
            "Generate 3 suggested follow-up questions for the user to explore the topic further.",
        ],
        output_instructions=[
            "Provide clear, concise, and accurate information in response to user queries.",
            "Maintain a friendly and professional tone throughout the conversation.",
            "Conclude each response with 3 relevant suggested questions for the user.",
        ],
    )

    # Initialize memory
    memory = AgentMemory()
    initial_message = CustomOutputSchema(
        chat_message="Hello! How can I assist you today?",
        suggested_user_questions=[
            "What can you do?",
            "Tell me a joke",
            "Tell me about how you were made",
        ],
    )
    memory.add_message("assistant", initial_message)

    # Create and return the agent
    return BaseAgent(
        config=BaseAgentConfig(
            client=client,
            model="gpt-4o-mini",
            system_prompt_generator=system_prompt_generator,
            memory=memory,
            output_schema=CustomOutputSchema,
        )
    )


@app.get("/")
async def read_root():
    return {"status": "Chat API is running"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)

    try:
        # Send initial greeting without creating agent
        await websocket.send_json(
            {
                "type": "message",
                "role": "assistant",
                "content": "Hello! How can I assist you today?",
                "suggested_questions": [
                    "What can you do?",
                    "Tell me a joke",
                    "Tell me about how you were made",
                ],
            }
        )

        agent = None  # Initialize agent as None

        while True:
            data = await websocket.receive_json()
            if data.get("type") == "message":
                user_message = data.get("content", "").strip()
                message_id = data.get("message_id", "")

                # Echo the user message back
                await websocket.send_json(
                    {
                        "type": "message",
                        "role": "user",
                        "content": user_message,
                        "message_id": f"{message_id}_user",
                    }
                )

                # Create agent only when first message is received
                if agent is None:
                    agent = create_agent()

                # Process through Atomic Agents
                input_schema = BaseAgentInputSchema(chat_message=user_message)
                current_response = ""
                current_questions = []

                async for partial_response in agent.run_async(input_schema):
                    if (
                        hasattr(partial_response, "chat_message")
                        and partial_response.chat_message
                    ):
                        if partial_response.chat_message != current_response:
                            current_response = partial_response.chat_message

                            # Stream the new content
                            await websocket.send_json(
                                {
                                    "type": "stream",
                                    "content": current_response,
                                    "message_id": f"{message_id}_assistant",
                                    "is_complete": False,
                                }
                            )

                        if hasattr(partial_response, "suggested_user_questions"):
                            current_questions = (
                                partial_response.suggested_user_questions
                            )

                # Send final message with suggested questions
                await websocket.send_json(
                    {
                        "type": "stream",
                        "content": current_response,
                        "message_id": f"{message_id}_assistant",
                        "is_complete": True,
                        "suggested_questions": current_questions,
                    }
                )

    except WebSocketDisconnect:
        active_connections.remove(websocket)
    except Exception as e:
        if websocket in active_connections:
            await websocket.send_json({"type": "error", "content": str(e)})
            active_connections.remove(websocket)
