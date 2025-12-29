"""Compatibility layer for LlmChat using OpenAI/LiteLLM"""

from typing import Optional, List
from dataclasses import dataclass
from openai import AsyncOpenAI
import os


@dataclass
class UserMessage:
    text: str


class LlmChat:
    """LLM Chat wrapper compatible with emergentintegrations interface"""
    
    def __init__(self, api_key: str = None, session_id: str = None, system_message: str = None):
        self.api_key = api_key or os.environ.get("OPENAI_API_KEY")
        self.session_id = session_id
        self.system_message = system_message
        self.model = "gpt-4o"
        self.provider = "openai"
        self._client = None
    
    def with_model(self, provider: str, model: str) -> "LlmChat":
        """Set the model to use"""
        self.provider = provider
        self.model = model
        return self
    
    def _get_client(self) -> AsyncOpenAI:
        if self._client is None:
            self._client = AsyncOpenAI(api_key=self.api_key)
        return self._client
    
    async def send_message(self, message: UserMessage) -> str:
        """Send a message and get a response"""
        client = self._get_client()
        
        messages = []
        if self.system_message:
            messages.append({"role": "system", "content": self.system_message})
        messages.append({"role": "user", "content": message.text})
        
        response = await client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=0.7,
            max_tokens=4096
        )
        
        return response.choices[0].message.content
