import os
import re
import json
import time
import urllib.parse
from html.parser import HTMLParser
import requests
import xml.etree.ElementTree as ET

BASE_URL = "https://www.confapiroma.it"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

visited_urls = set()
to_visit = set()
pages_data = []
discovered_assets = set()
css_files = set()

# Initialize from sitemap
try:
    r = requests.get(f"{BASE_URL}/sitemap.xml", headers=HEADERS, timeout=10)
    if r.status_code == 200:
        root = ET.fromstring(r.content)
        for loc in root.findall(".//{http://www.sitemaps.org/schemas/sitemap/0.9}loc"):
            url = loc.text.strip()
            to_visit.add(url)
except Exception as e:
    print(f"Error reading sitemap: {e}")

to_visit.add(BASE_URL)
to_visit.add(f"{BASE_URL}/index.php")
to_visit.add(f"{BASE_URL}/index.php/rassegna-stampa")
to_visit.add(f"{BASE_URL}/index.php/comunicati-stampa")
to_visit.add(f"{BASE_URL}/index.php/eventi-e-news")
to_visit.add(f"{BASE_URL}/index.php/contatti")

class SimpleLinkExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
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
                self.links.append(href)
        elif tag == "img":
            src = attr_dict.get("src", "")
            if src:
                self.images.append(src)
        elif tag == "link":
            rel = attr_dict.get("rel", "")
            href = attr_dict.get("href", "")
            if "stylesheet" in rel and href:
                self.css.append(href)

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

def normalize_url(url):
    url = urllib.parse.urljoin(BASE_URL, url)
    parsed = urllib.parse.urlparse(url)
    cleaned = urllib.parse.urlunparse((parsed.scheme, parsed.netloc, parsed.path, parsed.params, parsed.query, ''))
    return cleaned

print(f"Starting crawl with {len(to_visit)} seed URLs...")

while to_visit:
    url = to_visit.pop()
    if url in visited_urls:
        continue
    
    parsed = urllib.parse.urlparse(url)
    if not (parsed.netloc == "" or "confapiroma.it" in parsed.netloc):
        continue
    
    if any(url.lower().endswith(ext) for ext in ['.pdf', '.zip', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg', '.mp4']):
        discovered_assets.add(url)
        visited_urls.add(url)
        continue

    print(f"Crawling ({len(visited_urls)+1}): {url}")
    visited_urls.add(url)
    
    try:
        res = requests.get(url, headers=HEADERS, timeout=12)
        if res.status_code != 200:
            print(f"Status {res.status_code} for {url}")
            continue
            
        content_type = res.headers.get("Content-Type", "")
        if "text/html" not in content_type:
            continue
            
        html = res.text
        parser = SimpleLinkExtractor()
        parser.feed(html)
        
        page_info = {
            "url": url,
            "title": parser.title.strip(),
            "meta_description": parser.meta_desc.strip(),
            "meta_keywords": parser.meta_keywords.strip(),
            "h1": parser.h1s,
            "h2": parser.h2s,
            "h3": parser.h3s,
            "images": [urllib.parse.urljoin(url, img) for img in parser.images],
            "raw_html": html,
            "text_clean": " ".join("".join(parser.text_content).split())
        }
        pages_data.append(page_info)
        
        for css in parser.css:
            css_files.add(urllib.parse.urljoin(url, css))
            
        for img in parser.images:
            discovered_assets.add(urllib.parse.urljoin(url, img))
            
        for link in parser.links:
            full_link = normalize_url(link)
            parsed_link = urllib.parse.urlparse(full_link)
            if "confapiroma.it" in parsed_link.netloc and full_link not in visited_urls:
                if "logout" not in full_link and "format=pdf" not in full_link and "format=feed" not in full_link:
                    to_visit.add(full_link)
                    
        time.sleep(0.05)
    except Exception as e:
        print(f"Error fetching {url}: {e}")

print(f"\nCrawling complete! Visited {len(visited_urls)} URLs. Found {len(pages_data)} HTML pages.")
print(f"Found {len(discovered_assets)} assets and {len(css_files)} CSS files.")

# Save pages summary (without full html for lightweight inspection)
pages_summary = [
    {k: v for k, v in p.items() if k != "raw_html"}
    for p in pages_data
]

with open("analisi/raw_data/pages_inventory.json", "w", encoding="utf-8") as f:
    json.dump(pages_summary, f, ensure_ascii=False, indent=2)

with open("analisi/raw_data/pages_full.json", "w", encoding="utf-8") as f:
    json.dump(pages_data, f, ensure_ascii=False, indent=2)

with open("analisi/raw_data/assets_list.json", "w", encoding="utf-8") as f:
    json.dump(list(discovered_assets), f, ensure_ascii=False, indent=2)

with open("analisi/raw_data/css_files.json", "w", encoding="utf-8") as f:
    json.dump(list(css_files), f, ensure_ascii=False, indent=2)

print("Saved raw data to analisi/raw_data/")
