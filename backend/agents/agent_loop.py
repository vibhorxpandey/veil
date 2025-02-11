import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=os.getenv("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")
)

# 🔍 REAL SEARCH TOOL (LLM-based)
def search_tool(query):
    response = client.chat.completions.create(
        model="meta/llama3-70b-instruct",
        messages=[
            {
                "role": "system",
                "content": "You are a research assistant. Give 5 concise, real-world research insights on the topic."
            },
            {
                "role": "user",
                "content": query
            }
        ],
        temperature=0.5
    )

    return response.choices[0].message.content


# ✍️ REAL WRITE TOOL
def write_tool(context):
    response = client.chat.completions.create(
        model="meta/llama3-70b-instruct",
        messages=[
            {
                "role": "system",
                "content": "Write a clean, structured research summary with bullet points."
            },
            {
                "role": "user",
                "content": str(context)
            }
        ],
        temperature=0.5
    )

    return response.choices[0].message.content


# 🛠️ TOOL REGISTRY
tools = {
    "search": search_tool,
    "write": write_tool
}


# 🧭 PLANNER (simple for now)
def planner(goal, context):
    if not context:
        return {
            "tool": "search",
            "input": goal,
            "done": False
        }
    else:
        return {
            "tool": "write",
            "input": context,
            "done": True
        }


# 🔁 AGENT LOOP
def agent_loop(goal):
    memory = []
    context = []

    for step in range(5):
        plan = planner(goal, context)

        tool = plan["tool"]
        tool_input = plan["input"]

        print(f"\n[STEP {step}] Using tool: {tool}")

        result = tools[tool](tool_input)

        memory.append({
            "step": step,
            "tool": tool,
            "result": result
        })

        context.append(result)

        if plan["done"]:
            break

    return memory


# 🚀 RUN
if __name__ == "__main__":
    goal = "impact of AI on jobs"

    output = agent_loop(goal)

    print("\n\n=== FINAL OUTPUT ===\n")
    print(output[-1]["result"])