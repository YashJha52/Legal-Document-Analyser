import io
import os
import re
import shutil
import subprocess

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

def find_tesseract_binary():
    bin_path = shutil.which("tesseract")
    if bin_path:
        return bin_path
    for candidate in [
        "/opt/homebrew/bin/tesseract",
        "/usr/local/bin/tesseract",
        "/usr/bin/tesseract"
    ]:
        if os.path.isfile(candidate) and os.access(candidate, os.X_OK):
            return candidate
    return None

def extract_text_from_image_stream(stream_bytes):
    try:
        from PIL import Image
        img = Image.open(io.BytesIO(stream_bytes))
        width, height = img.size
        scale_factor = 1.5 if (width < 1400 or height < 1400) else 1.0
        if scale_factor != 1.0:
            target_w = int(width * scale_factor)
            target_h = int(height * scale_factor)
            img = img.resize((target_w, target_h), Image.Resampling.LANCZOS)
        if img.mode not in ("RGB", "L"):
            img = img.convert("RGB")
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        png_bytes = buf.getvalue()
        tess_bin = find_tesseract_binary()
        if not tess_bin:
            return ""
        proc = subprocess.run(
            [tess_bin, "stdin", "stdout", "--psm", "3"],
            input=png_bytes,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=35
        )
        ocr_text = proc.stdout.decode("utf-8", errors="ignore")
        if len(ocr_text.strip()) < 80:
            proc_block = subprocess.run(
                [tess_bin, "stdin", "stdout", "--psm", "6"],
                input=png_bytes,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=35
            )
            block_text = proc_block.stdout.decode("utf-8", errors="ignore")
            if len(block_text.strip()) > len(ocr_text.strip()):
                ocr_text = block_text
        return clean_extracted_text(ocr_text)
    except Exception:
        return ""

def is_image_data(file_content, filename=""):
    exts = (".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tiff", ".tif")
    if filename and filename.lower().endswith(exts):
        return True
    if isinstance(file_content, (bytes, bytearray)):
        if file_content.startswith(b"\x89PNG\r\n\x1a\n"):
            return True
        if file_content.startswith(b"\xff\xd8\xff"):
            return True
        if len(file_content) >= 12 and file_content[:4] == b"RIFF" and file_content[8:12] == b"WEBP":
            return True
        if file_content.startswith(b"BM"):
            return True
        if file_content.startswith(b"II*\x00") or file_content.startswith(b"MM\x00*"):
            return True
    return False

def extract_text_from_pdf_stream(stream_bytes):
    extracted_pages = []
    try:
        import pdfplumber
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
    if is_image_data(b"", file_path):
        with open(file_path, "rb") as file_handle:
            return extract_text_from_image_stream(file_handle.read())
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
        if is_image_data(file_content, filename):
            return extract_text_from_image_stream(file_content)
        try:
            raw_text = file_content.decode("utf-8")
        except UnicodeDecodeError:
            raw_text = file_content.decode("latin-1", errors="ignore")
        return clean_extracted_text(raw_text)
    return ""
