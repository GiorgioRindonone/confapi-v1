"""Import the six captured official pages; retain sources separately from UI data."""
import json, re, urllib.request
from pathlib import Path
from urllib.parse import urljoin, urlparse
from concurrent.futures import ThreadPoolExecutor
from lxml import html

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://www.confapiroma.it'
def clean(s): return re.sub(r'\s+', ' ', s).strip()
def cls(name): return './/*[contains(concat(" ",normalize-space(@class)," ")," '+name+' ")]'
pages = []
assets = {}
for slug in ['unioni-di-categoria','federazioni-regionali','associazioni-territoriali','associazioni-di-categoria','enti-bilaterali','video']:
    doc = html.fromstring((ROOT/'.firecrawl'/('sistema-'+slug+'.html')).read_text(encoding='utf-8'))
    main = doc.get_element_by_id('sp-main-body')
    items = []
    for index, box in enumerate(main.xpath(cls('sppb-addon-image-content'))):
        holder = box.xpath(cls('sppb-content-holder'))[0]
        title = clean(' '.join(holder.xpath('.//h2//text()')))
        subtitle = clean(' '.join(holder.xpath('.//h3//text()')))
        paragraphs = []
        for p in holder.xpath('.//p'):
            for br in p.xpath('.//br'): br.tail = '\n' + (br.tail or '')
            paragraphs.extend(clean(s) for s in ''.join(p.itertext()).split('\n') if clean(s))
        image = box.xpath(cls('sppb-image-holder'))[0]
        match = re.search(r'url\([\s\"\x27]*(.*?)[\s\"\x27]*\)',image.get('style',''))
        image_url = urljoin(BASE,match.group(1)) if match else ''
        local = '/assets/system/'+slug+'-'+str(index)+Path(urlparse(image_url).path).suffix if image_url else ''
        if image_url: assets[image_url]=local
        links = [{'label':clean(' '.join(a.itertext())) or 'Sito ufficiale','url':urljoin(BASE,a.get('href'))} for a in box.xpath('.//a[@href]') if not a.get('href').startswith('mailto:')]
        items.append(dict(name=title,subtitle=subtitle,paragraphs=paragraphs,image=local,links=links,group='Gruppi del Sistema CONFAPI' if title in ['GIC','CONFAPID'] else ''))
    if slug=='enti-bilaterali':
        for index, section in enumerate(main.xpath('.//section')):
            blocks=section.xpath(cls('sppb-addon-text-block'))
            if not blocks: continue
            block=blocks[0]
            name=clean(' '.join(block.xpath('.//h2//text()')))
            content=block.xpath(cls('sppb-addon-content'))[0]
            paragraphs=[clean(' '.join(el.itertext())) for el in content if el.tag in ['div','p'] and clean(' '.join(el.itertext()))]
            imgs=section.xpath('.//img[@src]')
            local=''
            if imgs:
                url=urljoin(BASE,imgs[0].get('src'))
                local='/assets/system/'+slug+'-'+str(index)+Path(urlparse(url).path).suffix
                assets[url]=local
            links=[dict(label=clean(' '.join(a.itertext())) or 'Sito ufficiale',url=urljoin(BASE,a.get('href'))) for a in section.xpath('.//a[@href]')]
            items.append(dict(name=name,subtitle=paragraphs[0] if paragraphs else '',paragraphs=paragraphs[1:],image=local,links=links,group=''))
    if slug=='video':
        original = next(p for p in json.loads((ROOT/'analisi/data/all_pages.json').read_text(encoding='utf-8-sig')) if p['url'].endswith('/video'))
        titles=original['h3'][2:9]+['Reportage parte seconda','70 anni']
        urls=[u for u in original['images'] if any(s in u for s in ['youtube.com/embed/','play.ilmattino.it','radiogold.it'])]
        items=[dict(name=t,url=u) for t,u in zip(titles,urls)]
    pages.append(dict(slug=slug,title=clean(' '.join(doc.xpath('//*[@id="sp-page-title"]//h2//text()'))),items=items,source=BASE+'/index.php/sistema-confapi/'+slug))
(ROOT/'public/data').mkdir(exist_ok=True)
(ROOT/'public/data/system.json').write_text(json.dumps(pages,ensure_ascii=False,indent=2),encoding='utf-8')
(ROOT/'public/js/system-data.js').write_text('window.confapiSystem = '+json.dumps(pages,ensure_ascii=False)+';\n',encoding='utf-8')
def download(pair):
    url,local=pair
    path=ROOT/'public'/local.lstrip('/')
    path.parent.mkdir(parents=True,exist_ok=True)
    if not path.exists():
        with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=30) as r: path.write_bytes(r.read())
    return local
with ThreadPoolExecutor(max_workers=4) as pool:
    for result in pool.map(download,assets.items()): print(result)
print(json.dumps([(p['slug'],len(p['items'])) for p in pages]))
