# Fine-tuning Open-Source Models on Chronicle Weaver Stories

Chronicle Weaver can export gameplay turns as JSONL training data, which you can use to fine-tune a local open-source model (e.g. via LoRA/QLoRA) to produce more historically-themed narrative completions.

## Supported base models

| Model | Size | Recommended adapter |
|-------|------|---------------------|
| `gemma3:4b` | 4B | LoRA rank 16 |
| `llama3.2:3b` | 3B | LoRA rank 8 |
| `mistral:7b` | 7B | QLoRA rank 16 |
| `llama3.1:8b` | 8B | QLoRA rank 16 |

## Exporting training data

1. Enable Supabase (`EXPO_PUBLIC_USE_SUPABASE=true`) and play at least 20 turns.
2. Grant export consent in your profile settings.
3. In-app: navigate to **Profile → Export Training Data** and select a story.
4. The app calls `exportStoryAsTrainingData(storyId)` and shares a `.jsonl` file.

Each line is:
```json
{"prompt": "<player choice text>", "completion": "<ai narrative response>"}
```

## LoRA fine-tuning with Unsloth (example)

```python
from unsloth import FastLanguageModel
model, tokenizer = FastLanguageModel.from_pretrained("unsloth/gemma-3-4b-it")
model = FastLanguageModel.get_peft_model(model, r=16, target_modules=["q_proj","v_proj"])

from datasets import load_dataset
ds = load_dataset("json", data_files="chronicle_training_*.jsonl", split="train")

from trl import SFTTrainer
trainer = SFTTrainer(model=model, tokenizer=tokenizer, train_dataset=ds,
                     dataset_text_field="prompt", max_seq_length=1024)
trainer.train()
model.save_pretrained_gguf("chronicle-gemma3-lora", tokenizer, quantization_method="q4_k_m")
```

## Loading the fine-tuned model in Ollama

```bash
# Create Modelfile
cat > Modelfile <<'EOF'
FROM ./chronicle-gemma3-lora/unsloth.Q4_K_M.gguf
SYSTEM "You are the Weaver, a master historical storyteller for Chronicle Weaver."
EOF

ollama create chronicle-gemma3 -f Modelfile
ollama run chronicle-gemma3
```

Then select **chronicle-gemma3** in the app's model selector.

## Data quality tips

- Export stories with 30+ turns for best results.
- Use the **Historically Accurate** realism setting to produce cleaner factual narratives.
- Filter out turns where `player_input` is very short (< 5 words).
