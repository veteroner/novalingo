# Run with Blender --background --python <this-file> -- <MakerLab-Tripo-source.glb> <output-dir>
import bpy,sys,math,json
from pathlib import Path
from mathutils import Vector
args=sys.argv[sys.argv.index('--')+1:];source=Path(args[0]);out=Path(args[1]);out.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=str(source))
meshes=[o for o in bpy.context.scene.objects if o.type=='MESH'];bpy.ops.object.select_all(action='DESELECT')
for o in meshes:o.select_set(True)
bpy.context.view_layer.objects.active=meshes[0];bpy.ops.object.join();obj=bpy.context.object;obj.name='GEO-Nova'
bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
# Tripo / MakerLab source looks along +X; normalize to Blender front -Y.
obj.rotation_mode='XYZ';obj.rotation_euler.z=-math.pi/2;bpy.ops.object.transform_apply(location=False,rotation=True,scale=False)
coords=[v.co for v in obj.data.vertices];lo=Vector(tuple(min(v[i] for v in coords) for i in range(3)));hi=Vector(tuple(max(v[i] for v in coords) for i in range(3)))
center=(lo+hi)/2; factor=3.0/(hi.z-lo.z)
for v in obj.data.vertices:v.co=(v.co-Vector((center.x,center.y,lo.z)))*factor
before=len(obj.data.polygons);mod=obj.modifiers.new('Mobile80k','DECIMATE');mod.ratio=80000/before;mod.use_collapse_triangulate=True;bpy.ops.object.modifier_apply(modifier=mod.name)
for poly in obj.data.polygons:poly.use_smooth=True
for mat in obj.data.materials:
 if mat and mat.use_nodes:
  bs=mat.node_tree.nodes.get('Principled BSDF')
  if bs:bs.inputs['Metallic'].default_value=0;bs.inputs['Roughness'].default_value=.72
  for n in mat.node_tree.nodes:
   if n.type=='TEX_IMAGE' and n.image:
    im=n.image
    if max(im.size)>2048:im.scale(2048,2048)
    im.pack()
scene=bpy.context.scene
bpy.ops.wm.save_as_mainfile(filepath=str(out/'nova-mobile-static.blend'))
bpy.ops.export_scene.gltf(filepath=str(out/'nova-mobile-static.glb'),export_format='GLB',use_selection=True,export_animations=False,export_image_format='JPEG',export_jpeg_quality=92)
report={'source':str(source),'triangles_before':before,'triangles_after':len(obj.data.polygons),'bytes':(out/'nova-mobile-static.glb').stat().st_size,'orientation':'front -Y, feet Z0, height3','status':'static candidate, not rigged'}
(out/'report.json').write_text(json.dumps(report,indent=2));print('REPORT',report)
