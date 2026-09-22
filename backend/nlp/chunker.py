import re
from backend.utils.config import MAX_CHUNK_TOKENS, DEFAULT_CHUNK_OVERLAP

def estimate_token_count(text):
    if not text:
        return 0
    words = text.split()
    punctuation_count = len(re.findall(r"[.,!?;:\"'()\[\]{}]", text))
    estimated = int(len(words) * 1.25 + punctuation_count * 0.2)
    return max(1, estimated)

def split_into_sentences(text):
    sentence_pattern = r"(?<=[.!?])\s+(?=[A-Z0-9\"\'])"
    raw_sentences = re.split(sentence_pattern, text)
    return [s.strip() for s in raw_sentences if s.strip()]

def chunk_by_words(text, chunk_size=1000, chunk_overlap=200):
    if not text:
        return []
    words = text.split()
    if len(words) <= chunk_size:
        return [{
            "chunk_id": 0,
            "text": text.strip(),
            "word_count": len(words),
            "start_word_index": 0,
            "end_word_index": len(words)
        }]
    chunks = []
    step = max(chunk_size - chunk_overlap, 1)
    chunk_index = 0
    start_index = 0
    while start_index < len(words):
        end_index = min(start_index + chunk_size, len(words))
        chunk_words = words[start_index:end_index]
        chunks.append({
            "chunk_id": chunk_index,
            "text": " ".join(chunk_words),
            "word_count": len(chunk_words),
            "start_word_index": start_index,
            "end_word_index": end_index
        })
        chunk_index += 1
        if end_index >= len(words):
            break
        start_index += step
    return chunks

def split_into_legal_sections(text):
    pattern = r"(?=(?:\n\s*(?:Section|Article|Clause|\d+\.|\([a-z0-9]+\))\s+[A-Z0-9]))"
    raw_sections = re.split(pattern, text)
    cleaned_sections = [sec.strip() for sec in raw_sections if sec.strip()]
    if len(cleaned_sections) <= 1:
        cleaned_sections = [p.strip() for p in text.split("\n\n") if p.strip()]
    return cleaned_sections if cleaned_sections else [text.strip()]

def smart_chunk_legal_document(text, max_tokens=MAX_CHUNK_TOKENS, overlap_tokens=DEFAULT_CHUNK_OVERLAP):
    if not text:
        return []
    total_tokens = estimate_token_count(text)
    if total_tokens <= max_tokens:
        return [{
            "chunk_id": 0,
            "text": text.strip(),
            "token_count": total_tokens,
            "char_start": 0,
            "char_end": len(text.strip()),
            "is_fallback": False
        }]
    sections = split_into_legal_sections(text)
    chunks = []
    current_sections = []
    current_tokens = 0
    chunk_id = 0
    char_offset = 0
    for section in sections:
        sec_tokens = estimate_token_count(section)
        if current_tokens + sec_tokens > max_tokens and current_sections:
            combined_text = "\n\n".join(current_sections)
            chunks.append({
                "chunk_id": chunk_id,
                "text": combined_text,
                "token_count": current_tokens,
                "char_start": char_offset,
                "char_end": char_offset + len(combined_text),
                "is_fallback": True
            })
            char_offset += len(combined_text)
            chunk_id += 1
            overlap_accum = []
            overlap_count = 0
            for prev_sec in reversed(current_sections):
                prev_tokens = estimate_token_count(prev_sec)
                if overlap_count + prev_tokens <= overlap_tokens:
                    overlap_accum.insert(0, prev_sec)
                    overlap_count += prev_tokens
                else:
                    break
            current_sections = overlap_accum
            current_tokens = overlap_count
        current_sections.append(section)
        current_tokens += sec_tokens
    if current_sections:
        combined_text = "\n\n".join(current_sections)
        chunks.append({
            "chunk_id": chunk_id,
            "text": combined_text,
            "token_count": current_tokens,
            "char_start": char_offset,
            "char_end": char_offset + len(combined_text),
            "is_fallback": True
        })
    return chunks

def chunk_by_clauses(text):
    if not text:
        return []
    sections = split_into_legal_sections(text)
    chunks = []
    char_offset = 0
    for idx, sec in enumerate(sections):
        sec_len = len(sec)
        chunks.append({
            "chunk_id": idx,
            "text": sec,
            "word_count": len(sec.split()),
            "token_count": estimate_token_count(sec),
            "char_start": char_offset,
            "char_end": char_offset + sec_len
        })
        char_offset += sec_len + 2
    return chunks

