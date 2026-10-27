"""Split an authored GLB into a compact glTF/buffer/JPEG package for WKWebView.

Usage: python3 scripts/nova/package-model.py <rig.glb> <public-output-directory>
No image transformation, generation service, or network access is used here.
"""
import json
import struct
import sys
from pathlib import Path

source, destination = map(Path, sys.argv[1:3])
destination.mkdir(parents=True, exist_ok=True)
data = source.read_bytes()
magic, version, declared_size = struct.unpack_from('<III', data)
assert magic == 0x46546C67 and version == 2 and declared_size == len(data)
json_size, json_type = struct.unpack_from('<II', data, 12)
assert json_type == 0x4E4F534A
model = json.loads(data[20:20 + json_size])
binary = data[28 + json_size:]
image_views = set()
for index, image in enumerate(model.get('images', [])):
    view_index = image.pop('bufferView')
    image_views.add(view_index)
    view = model['bufferViews'][view_index]
    offset = view.get('byteOffset', 0)
    extension = {'image/jpeg': 'jpg', 'image/png': 'png'}[image.pop('mimeType')]
    name = f'nova-color-{index}.{extension}'
    (destination / name).write_bytes(binary[offset:offset + view['byteLength']])
    image['uri'] = name

packed = bytearray()
views, mapping = [], {}
for index, view in enumerate(model['bufferViews']):
    if index in image_views:
        continue
    mapping[index] = len(views)
    while len(packed) % 4:
        packed.append(0)
    new_view = dict(view)
    offset = view.get('byteOffset', 0)
    new_view['byteOffset'] = len(packed)
    packed.extend(binary[offset:offset + view['byteLength']])
    views.append(new_view)

def remap(value):
    if isinstance(value, dict):
        for key, item in value.items():
            if key == 'bufferView':
                value[key] = mapping[item]
            else:
                remap(item)
    elif isinstance(value, list):
        for item in value:
            remap(item)

remap(model['accessors'])
model['bufferViews'] = views
model['buffers'] = [{'byteLength': len(packed), 'uri': 'nova.bin'}]
model['asset']['copyright'] = (
    'Powered by MakerWorld-Image-to-3D (https://makerworld.com/makerlab/imageTo3d); '
    'local rig and mobile optimization by NovaLingo.'
)
(destination / 'nova.bin').write_bytes(packed)
(destination / 'nova.gltf').write_text(json.dumps(model, separators=(',', ':')) + '\n')
print(json.dumps({'package_bytes': sum(p.stat().st_size for p in destination.iterdir() if p.is_file()),
                  'clips': [item['name'] for item in model.get('animations', [])]}))
