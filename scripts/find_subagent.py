import json

with open(r'C:\Users\anasr\.gemini\antigravity\brain\c726d5ee-f5a8-4b8e-9d70-8bf2e76b80d7\.system_generated\logs\transcript.jsonl', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if 'invoke_subagent' in line:
            d = json.loads(line)
            print(f'Line {i}, Step {d.get("step_index")}:', d.get('tool_calls'))

