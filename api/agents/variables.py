from typing import TypedDict, Annotated, Sequence
from langchain_core.messages import BaseMessage, AIMessage
from langgraph.graph.message import add_messages


class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage | AIMessage], add_messages]