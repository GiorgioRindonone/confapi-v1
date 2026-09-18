import os
import re
import json
import time
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed
from html.parser import HTMLParser
import requests
import xml.etree.ElementTree as ET

BASE_URL = "https://www.confapiroma.it"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

os.makedirs("analisi/raw_data", exist_ok=True)
os.makedirs("analisi/assets/images", exist_ok=True)
os.makedirs("analisi/assets/logos", exist_ok=True)
os.makedirs("analisi/assets/css", exist_ok=True)
os.makedirs("analisi/articles", exist_ok=True)

class HTMLAnalysisParser(HTMLParser):
    def __init__(self, base_url):
        super().__init__()
        self.base_url = base_url
        self.links = []
        self.images = []
        self.css = []
        self.title = ""
        self.in_title = False
        self.meta_desc = ""
        self.meta_keywords = ""
        self.h1s = []
        self.h2s = []
        self.h3s = []
        self.current_tag = None
        self.current_text = []
        self.text_content = []

    def handle_starttag(self, tag, attrs):
        self.current_tag = tag
        attr_dict = dict(attrs)
        
        if tag == "title":
            self.in_title = True
        elif tag == "meta":
            name = attr_dict.get("name", "").lower()
            prop = attr_dict.get("property", "").lower()
            if name == "description" or prop == "og:description":
                self.meta_desc = attr_dict.get("content", "")
            if name == "keywords":
                self.meta_keywords = attr_dict.get("content", "")
        elif tag == "a":
            href = attr_dict.get("href", "")
            if href and not href.startswith("#") and not href.startswith("javascript:"):
                self.links.append(urllib.parse.urljoin(self.base_url, href))
        elif tag == "img":
            src = attr_dict.get("src", "")
            if src:
                self.images.append(urllib.parse.urljoin(self.base_url, src))
        elif tag == "link":
            rel = attr_dict.get("rel", "")
            href = attr_dict.get("href", "")
            if "stylesheet" in rel and href:
                self.css.append(urllib.parse.urljoin(self.base_url, href))

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        if tag in ["h1", "h2", "h3"]:
            txt = "".join(self.current_text).strip()
            if txt:
                if tag == "h1": self.h1s.append(txt)
                elif tag == "h2": self.h2s.append(txt)
                elif tag == "h3": self.h3s.append(txt)
            self.current_text = []
        self.current_tag = None

    def handle_data(self, data):
        if self.in_title:
            self.title += data
        if self.current_tag in ["h1", "h2", "h3"]:
            self.current_text.append(data)
        if self.current_tag not in ["script", "style", "noscript"]:
            self.text_content.append(data)

def fetch_url(url):
    try:
        r = requests.get(url, headers=HEADERS, timeout=8)
        if r.status_code == 200:
            return url, r.text, r.headers.get("Content-Type", "")
        return url, None, str(r.status_code)
    except Exception as e:
        return url, None, str(e)

# 1. Get seed URLs from sitemap
seed_urls = set()
try:
    r = requests.get(f"{BASE_URL}/sitemap.xml", headers=HEADERS, timeout=8)
    if r.status_code == 200:
        root = ET.fromstring(r.content)
        for loc in root.findall(".//{http://www.sitemaps.org/schemas/sitemap/0.9}loc"):
            seed_urls.add(loc.text.strip())
except Exception as e:
    print(f"Sitemap fetch failed: {e}")

seed_urls.add(BASE_URL)
seed_urls.add(f"{BASE_URL}/index.php")

print(f"Discovered {len(seed_urls)} seed URLs. Starting parallel crawl...")

visited_urls = set()
all_pages = []
all_images = set()
all_css = set()
to_fetch = list(seed_urls)

session = requests.Session()
adapter = requests.adapters.HTTPAdapter(pool_connections=25, pool_maxsize=25)
session.mount("http://", adapter)
session.mount("https://", adapter)

with ThreadPoolExecutor(max_workers=15) as executor:
    future_to_url = {executor.submit(fetch_url, u): u for u in to_fetch}
    for future in as_completed(future_to_url):
        url, html, ctype = future.result()
        visited_urls.add(url)
        if html and "text/html" in ctype:
            parser = HTMLAnalysisParser(url)
            try:
                parser.feed(html)
                clean_text = " ".join("".join(parser.text_content).split())
                
                page_record = {
                    "url": url,
                    "title": parser.title.strip(),
                    "meta_description": parser.meta_desc.strip(),
                    "meta_keywords": parser.meta_keywords.strip(),
                    "h1": parser.h1s,
                    "h2": parser.h2s,
                    "h3": parser.h3s,
                    "images": parser.images,
                    "text_sample": clean_text[:2000],
                    "full_text": clean_text
                }
                all_pages.append(page_record)
                
                for img in parser.images:
                    all_images.add(img)
                for css in parser.css:
                    all_css.add(css)
            except Exception as e:
                print(f"Parse error for {url}: {e}")

print(f"Crawled {len(all_pages)} valid HTML pages.")

# Save pages inventory
with open("analisi/raw_data/pages_inventory.json", "w", encoding="utf-8") as f:
    json.dump(all_pages, f, ensure_ascii=False, indent=2)

# Download key brand assets (logos, presets CSS)
print(f"Downloading brand assets & stylesheets...")
logos_to_fetch = [
    f"{BASE_URL}/images/confapi/logo/logo-confapi_1000.png",
    f"{BASE_URL}/images/confapi/logo/logo-confapi_800.png",
    f"{BASE_URL}/templates/shaper_finance/images/favicon.ico",
    f"{BASE_URL}/images/confapi/logo/logo_confapi_roma.png"
]

for lurl in logos_to_fetch:
    try:
        r = requests.get(lurl, headers=HEADERS, timeout=8)
        if r.status_code == 200:
            fname = os.path.basename(urllib.parse.urlparse(lurl).path)
            with open(f"analisi/assets/logos/{fname}", "wb") as f:
                f.write(r.content)
            print(f"Downloaded logo: {fname}")
    except Exception as e:
        print(f"Failed logo {lurl}: {e}")

# Download CSS
for curl in all_css:
    try:
        r = requests.get(curl, headers=HEADERS, timeout=8)
        if r.status_code == 200:
            fname = os.path.basename(urllib.parse.urlparse(curl).path)
            if not fname.endswith('.css'): fname += '.css'
            with open(f"analisi/assets/css/{fname}", "w", encoding="utf-8", errors="ignore") as f:
                f.write(r.text)
    except Exception as e:
        pass

print("Done downloading brand assets and stylesheets.")
