from langgraph.graph import StateGraph, START, END
from langchain_core.messages import AIMessage
from langgraph.prebuilt import ToolNode
from typing import Callable
from tools.web import search_tool
from tools.console import run_command
from .variables import AgentState

tools = [search_tool, run_command]
tools = [search_tool]


def should_continue(state: AgentState):
    messages = state["messages"]
    last_message = messages[-1]
    if isinstance(last_message, AIMessage) and last_message.tool_calls:
        return "continue"
    else:
        return "end"


def get_tool_first_agent(model_call: Callable):
    graph = StateGraph(AgentState)
    graph.add_node("agent", model_call)

    tool_node = ToolNode(tools=tools)
    graph.add_node("tools", tool_node)

    graph.add_edge(START, "agent")
    graph.add_conditional_edges(
        "agent", should_continue, path_map={"continue": "tools", "end": END}
    )
    graph.add_edge("tools", "agent")

    return graph.compile()
