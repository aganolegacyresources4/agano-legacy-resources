#!/usr/bin/env python3
"""Generate local responsive WebP assets. Developer tool; the website needs no Python.

Usage: python3 scripts/optimise-images.py --source-dir /absolute/path/to/original-uploads
Requires Pillow. Existing full-size web assets are retained except the sunset hero.
Thumbnail crops reproduce the gallery's existing object-fit/25% focal framing.
"""
from pathlib import Path
from PIL import Image, ImageOps
import argparse, hashlib, json

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source-dir', type=Path, required=True)
args = parser.parse_args()
base = Path(__file__).resolve().parent.parent
web = base/'dist' if (base/'dist/index.html').is_file() else base
manifest_path = base/'docs/company-image-manifest.json'
manifest = json.loads(manifest_path.read_text())

def save(image, path, width, role, quality):
    path.parent.mkdir(parents=True, exist_ok=True)
    height = round(image.height * width / image.width)
    variant = image.resize((width,height), Image.Resampling.LANCZOS) if image.size != (width,height) else image
    variant.save(path, 'WEBP', quality=quality, method=6)
    with Image.open(path) as check:
        check.verify()
    return {'file':str(path.relative_to(web)), 'width':width, 'height':height,
            'bytes':path.stat().st_size, 'role':role, 'quality':quality,
            'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}

for record in manifest['images']:
    source = args.source_dir/record['source_filename']
    if not source.is_file():
        raise SystemExit('Missing original image: '+str(source))
    if hashlib.sha256(source.read_bytes()).hexdigest() != record['source_sha256']:
        raise SystemExit('Source changed; review and update its provenance before generating: '+str(source))
    image = ImageOps.exif_transpose(Image.open(source)).convert('RGB')
    key = record['key']
    folder = web/'assets/images/company'
    full = folder/(key+'-'+str(image.width)+'.webp')
    if not full.is_file():
        raise SystemExit('Expected existing full-size asset: '+str(full))
    # Reproduce the 4:3 frame already used in CSS, without changing scene content.
    ratio = 4/3
    if image.width/image.height > ratio:
        width = round(image.height*ratio)
        left = round((image.width-width)/2)
        cropped = image.crop((left,0,left+width,image.height))
    else:
        height = round(image.width/ratio)
        top = round((image.height-height)*.25)
        cropped = image.crop((0,top,image.width,top+height))
    variants = [save(cropped,folder/(key+'-thumb-480.webp'),480,'gallery-thumbnail',70),
                save(cropped,folder/(key+'-thumb-640.webp'),640,'gallery-thumbnail',64),
                save(image,folder/(key+'-640.webp'),640,'content-small',74)]
    if image.width > 960:
        variants.append(save(image,folder/(key+'-960.webp'),960,'content-medium',76))
    if key == 'mine-at-sunset':
        large = save(image,full,image.width,'content-large',78)
    else:
        large = {'file':str(full.relative_to(web)), 'width':image.width, 'height':image.height,
                 'bytes':full.stat().st_size, 'role':'content-large',
                 'sha256':hashlib.sha256(full.read_bytes()).hexdigest()}
    variants.append(large)
    record['variants'] = variants
    record['thumbnail_framing'] = '4:3 object-fit:cover equivalent; horizontal centre, vertical position 25%; full-size links retain the whole image.'
manifest['processing'] = 'Mechanically resized and encoded local WebP variants. Gallery thumbnails reproduce the existing 4:3 focal framing; full-size images retain the original composition. No subjects, signs or operational features added.'
manifest_path.write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n')
print(json.dumps({'images':len(manifest['images']),
                  'gallery_480_bytes':sum(r['variants'][0]['bytes'] for r in manifest['images']),
                  'gallery_640_bytes':sum(r['variants'][1]['bytes'] for r in manifest['images']),
                  'largest_thumbnail_bytes':max(v['bytes'] for r in manifest['images'] for v in r['variants'] if v['role']=='gallery-thumbnail')},indent=2))
