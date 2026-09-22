import io
import re
try:
    import pdfplumber
except ImportError:
    pdfplumber = None

def clean_extracted_text(text):
    if not text:
        return ""
    cleaned = text.replace("\r\n", "\n").replace("\r", "\n")
    cleaned = re.sub(r"(\w+)-\n(\w+)", r"\1\2", cleaned)
    cleaned = re.sub(r"(?i)\bpage\s+\d+\s+(?:of|\/)\s+\d+\b", "", cleaned)
    cleaned = re.sub(r"(?i)---+\s*page\s*\d+\s*---+", "", cleaned)
    cleaned = re.sub(r"(?i)\[\s*page\s*\d+\s*\]", "", cleaned)
    cleaned = re.sub(r"^[ \t]*\d+[ \t]*$", "", cleaned, flags=re.MULTILINE)
    cleaned = re.sub(r"[_\-\*\=\#]{4,}", " ", cleaned)
    cleaned = re.sub(r"[ \t]+", " ", cleaned)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return cleaned.strip()

def extract_text_from_pdf_stream(stream_bytes):
    extracted_pages = []
    try:
        with pdfplumber.open(io.BytesIO(stream_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    extracted_pages.append(page_text)
    except Exception:
        try:
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(stream_bytes))
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    extracted_pages.append(page_text)
        except Exception:
            extracted_pages = []
    raw_text = "\n\n".join(extracted_pages)
    return clean_extracted_text(raw_text)

def extract_text_from_file_path(file_path):
    if file_path.lower().endswith(".pdf"):
        with open(file_path, "rb") as file_handle:
            return extract_text_from_pdf_stream(file_handle.read())
    try:
        with open(file_path, "r", encoding="utf-8") as file_handle:
            raw_text = file_handle.read()
    except UnicodeDecodeError:
        with open(file_path, "r", encoding="latin-1") as file_handle:
            raw_text = file_handle.read()
    return clean_extracted_text(raw_text)

def parse_document(file_content, filename=""):
    if isinstance(file_content, str):
        return clean_extracted_text(file_content)
    if isinstance(file_content, (bytes, bytearray)):
        if filename.lower().endswith(".pdf") or file_content.startswith(b"%PDF"):
            return extract_text_from_pdf_stream(file_content)
        try:
            raw_text = file_content.decode("utf-8")
        except UnicodeDecodeError:
            raw_text = file_content.decode("latin-1", errors="ignore")
        return clean_extracted_text(raw_text)
    return ""
