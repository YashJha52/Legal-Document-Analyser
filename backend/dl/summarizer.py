import json
import re
from backend.nlp.chunker import smart_chunk_legal_document
from backend.dl.extractor import get_llama_model
from backend.dl.rag_indexer import retrieve_context

def fallback_plain_english_summary(text):
    paragraphs = [p.strip() for p in text.split("\n\n") if len(p.strip().split()) >= 6]
    key_sentences = paragraphs[:3] if paragraphs else [text[:300]]
    exec_summary = " ".join(key_sentences)
    obligations = [
        "Comply with mutual confidentiality protections.",
        "Observe designated termination notice deadlines.",
        "Adhere to specified liability limits and dispute resolution rules."
    ]
    action_items = [
        "Verify party signatory designations and effective dates.",
        "Track auto-renewal dates to prevent unintended extensions.",
        "Review liability exposure and indemnification requirements with legal counsel."
    ]
    return {
        "executive_summary": exec_summary,
        "key_obligations": obligations,
        "action_items": action_items
    }

def summarize_chunk_llm(chunk_text, max_tokens=600):
    chunk_text = str(chunk_text)
    llama_model = get_llama_model()
    if llama_model is None:
        return fallback_plain_english_summary(chunk_text)["executive_summary"]
    context_text = retrieve_context(chunk_text[:500], n_results=1)
    
    prompt = f"""<|im_start|>system
You are a legal summarizer specializing in Indian Law. Summarize the given legal text into clear, plain English accessible to non-lawyers in 2-4 sentences.
Use the following relevant Indian case law context as a reference if applicable:
{context_text}
<|im_end|>
<|im_start|>user
Legal excerpt:
{chunk_text[:3500]}<|im_end|>
<|im_start|>assistant
"""
    try:
        response = llama_model(
            prompt=prompt,
            max_tokens=max_tokens,
            temperature=0.2,
            stop=["<|im_end|>"],
            stream=False
        )
        if isinstance(response, dict):
            return response["choices"][0]["text"].strip()
    except Exception:
        return fallback_plain_english_summary(chunk_text)["executive_summary"]

def generate_plain_english_summary(text, max_tokens=8192):
    chunks = smart_chunk_legal_document(text=text,max_tokens=max_tokens)
    if not chunks:
        return {
            "executive_summary": "No text provided for analysis.",
            "key_obligations": [],
            "action_items": []
        }
    llama_model = get_llama_model()
    if len(chunks) == 1 and llama_model is not None:
        first_chunk = chunks[0]
        chunk_text = str(first_chunk["text"]) if isinstance(first_chunk, dict) else str(first_chunk)
        context_text = retrieve_context(chunk_text[:500], n_results=2)
        
        prompt = f"""<|im_start|>system
You are a legal AI assistant specializing in Indian Law. Summarize this contract into plain English and return STRICT JSON with keys:
"executive_summary" (2-4 sentences explaining purpose, main deal, and primary risks),
"key_obligations" (list of 3-5 bullet points),
"action_items" (list of 2-4 actionable next steps).

Use the following relevant Indian case law context as a reference if applicable:
{context_text}
<|im_end|>
<|im_start|>user
Legal Document:
{chunk_text[:6000]}<|im_end|>
<|im_start|>assistant
"""
        try:
            response = llama_model(
                prompt=prompt,
                max_tokens=800,
                temperature=0.2,
                stop=["<|im_end|>", "```"],
                stream=False
            )
            if isinstance(response, dict):
                content = response["choices"][0]["text"].strip()
                cleaned_json = re.sub(r"^```(?:json)?", "", content).rstrip("`").strip()
                data = json.loads(cleaned_json)
                if "executive_summary" in data:
                    return {
                        "executive_summary": data.get("executive_summary", ""),
                        "key_obligations": data.get("key_obligations", []),
                        "action_items": data.get("action_items", [])
                    }
        except Exception:
            pass
    if len(chunks) == 1:
        first_chunk = chunks[0]
        chunk_text = str(first_chunk["text"]) if isinstance(first_chunk, dict) else str(first_chunk)
        return fallback_plain_english_summary(chunk_text)
    intermediate_summaries = []
    for chunk in chunks:
        chunk_text = str(chunk["text"]) if isinstance(chunk, dict) else str(chunk)
        intermediate_summaries.append(summarize_chunk_llm(chunk_text))
    combined_notes = " ".join(intermediate_summaries)
    if llama_model is not None:
        prompt = f"""<|im_start|>system
Combine these section summaries into an overall Executive Summary in plain English. Return STRICT JSON with keys "executive_summary", "key_obligations", "action_items".<|im_end|>
<|im_start|>user
Section summaries:
{combined_notes[:4000]}<|im_end|>
<|im_start|>assistant
"""
        try:
            response = llama_model(
                prompt=prompt,
                max_tokens=800,
                temperature=0.2,
                stop=["<|im_end|>", "```"],
                stream=False
            )
            if isinstance(response, dict):
                content = response["choices"][0]["text"].strip()
                cleaned_json = re.sub(r"^```(?:json)?", "", content).rstrip("`").strip()
                data = json.loads(cleaned_json)
                if "executive_summary" in data:
                    return data
        except Exception:
            pass
    fallback = fallback_plain_english_summary(text)
    fallback["executive_summary"] = "Hierarchical analysis: " + " ".join(intermediate_summaries[:2])
    return fallback
