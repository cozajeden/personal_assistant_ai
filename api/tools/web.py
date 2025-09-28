from langchain_community.tools import DuckDuckGoSearchRun
from langchain_core.tools import Tool
search = DuckDuckGoSearchRun()

search_tool = Tool(
    name="web_search",
    description="Search the web for the given query.",
    func=search.run,
)