"""Author portable eyelid shells and an articulated bill on the detailed Nova.

Blender --background --python scripts/nova/author-face.py -- <output-dir> [--render]
Source geometry/UVs stay intact except for the lower bill, closed locally for articulation.
Renders provide a failure gate; no Python handlers are required in the exported GLTF.
"""
import bpy,bmesh,math,sys,numpy as np
from pathlib import Path
from mathutils import Vector,Matrix
from mathutils.bvhtree import BVHTree
root=Path(__file__).resolve().parents[2];args=sys.argv[sys.argv.index('--')+1:];out=Path(args[0]);out.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(root/'e2e/assets/nova-v4-rig.blend'))
obj=bpy.data.objects['Nova_Feathers'];arm=bpy.data.objects['Nova_Rig'];obj.shape_key_clear()
bvh=BVHTree.FromObject(obj,bpy.context.evaluated_depsgraph_get())
def front(x,z):
 hit=bvh.ray_cast(Vector((x,-5,z)),Vector((0,1,0)))[0]
 return hit.y if hit else -.8
def material(name,color):
 m=bpy.data.materials.new(name);m.use_nodes=True;m.node_tree.nodes.clear();bs=m.node_tree.nodes.new('ShaderNodeBsdfPrincipled');o=m.node_tree.nodes.new('ShaderNodeOutputMaterial');m.node_tree.links.new(bs.outputs['BSDF'],o.inputs['Surface']);bs.inputs['Base Color'].default_value=(*color,1);bs.inputs['Roughness'].default_value=.85;return m
def skin(o):
 o.vertex_groups.clear();g=o.vertex_groups.new(name='Head');g.add(list(range(len(o.data.vertices))),1,'REPLACE');o.modifiers.clear();m=o.modifiers.new('FaceSkin','ARMATURE');m.object=arm;o.parent=arm
cream=material('Warm ivory eyelids',(.63,.55,.43));ink=material('Soft dark lash',(.038,.025,.024));oral=material('Mouth interior',(.014,.004,.003))
lids=[];lashes=[]
for name,cx,cz,rx,rz,tilt in [('L',-.537,1.90,.215,.285,-.18),('R',.207,1.705,.298,.242,.12)]:
 # Smooth quadric over the eye, fitted to raycast samples, instead of copying iris ridges.
 samples=[];ys=[]
 for u in np.linspace(-.95,.95,19):
  for v in np.linspace(-.95,.95,19):
   if u*u+v*v<.95:
    z=cz+rz*v;x=cx+rx*u+tilt*(z-cz);samples.append([1,u,v,u*u,u*v,v*v]);ys.append(front(x,z))
 coeff=np.linalg.lstsq(np.array(samples),np.array(ys),rcond=None)[0];delta=min(y-np.dot(c,coeff) for c,y in zip(samples,ys))-.009;coeff[0]+=delta
 def ysurface(x,z):
  v=(z-cz)/rz;u=(x-cx-tilt*(z-cz))/rx;f=float(np.dot([1,u,v,u*u,u*v,v*v],coeff));r=math.sqrt(u*u+v*v);t=max(0,min(1,(r-.94)/.06));t=t*t*(3-2*t);return f*(1-t)+(front(x,z)+.003)*t
 def coords(b):
  vs=[]
  for part in [1,-1]:
   for i in range(49):
    u=-1+2*i/48;arc=math.sqrt(max(0,1-u*u));edge=part*rz*arc;seam=-.025+.05*u*u
    for j in range(17):
     v=j/16;z=cz+edge+(seam-edge)*v*b;x=cx+rx*u+tilt*(z-cz)
     # Rest is fully folded under the facial rim; moving targets are smooth shells.
     y=ysurface(x,z) if b>0 else front(x,z)+.03
     vs.append((x,y,z))
  return vs
 vs=coords(0);fs=[]
 for part in range(2):
  base=part*49*17
  for i in range(48):
   for j in range(16):
    a=base+i*17+j;fs.append((a,a+17,a+18,a+1) if part==0 else (a+1,a+18,a+17,a))
 mesh=bpy.data.meshes.new('LidSurface_'+name);mesh.from_pydata(vs,[],fs);mesh.update();lid=bpy.data.objects.new('Lid_'+name,mesh);bpy.context.collection.objects.link(lid);mesh.materials.append(cream)
 for p in mesh.polygons:p.use_smooth=True
 for key,b in [('Basis',0),('Blink_Quarter',.25),('Blink_Half',.5),('Blink_ThreeQuarter',.75),('Blink_Closed',1)]:
  sk=lid.shape_key_add(name=key,from_mix=False);sk.value=0
  for dst,co in zip(sk.data,coords(b)):dst.co=co
 skin(lid);lids.append(lid)
 # A crease appears only at complete closure; hidden within the lid at rest.
 lv=[];lf=[]
 for i in range(49):
  u=-1+2*i/48;z=cz-.025+.05*u*u;x=cx+rx*u+tilt*(z-cz);y=ysurface(x,z)-.003
  width=.0055*math.sin(math.pi*i/48)
  lv.extend([(x,y,z-width),(x,y,z+width)])
  if i: a=2*(i-1);lf.append((a,a+2,a+3,a+1))
 mesh=bpy.data.meshes.new('LashSurface_'+name);mesh.from_pydata(lv,[],lf);mesh.materials.append(ink);o=bpy.data.objects.new('Lash_'+name,mesh);bpy.context.collection.objects.link(o)
 basis=o.shape_key_add(name='Basis',from_mix=False)
 for p in basis.data:p.co.y+=.09
 sk=o.shape_key_add(name='Blink_Closed',from_mix=False);sk.value=0
 for p,co in zip(sk.data,lv):p.co=co
 skin(o);lashes.append(o)
# Separate the textured lower bill. No cream facial vertices are stretched by speech.
tex=next(n.image for n in obj.data.materials[0].node_tree.nodes if n.type=='TEX_IMAGE');pixels=np.array(tex.pixels[:]).reshape(tex.size[1],tex.size[0],4);uv=obj.data.uv_layers.active.data
selected=set()
for p in obj.data.polygons:
 co=p.center;x,y,z=co;line=1.633+.658*x
 if not(-.47<x<-.18 and y<-.88 and 1.30<z<1.59 and z<line+.008):continue
 rgb=[]
 for li in p.loop_indices:
  u,v=uv[li].uv;rgb.append(pixels[min(tex.size[1]-1,int(v*tex.size[1])),min(tex.size[0]-1,int(u*tex.size[0])),:3])
 r,g,b=np.mean(rgb,axis=0)
 if r>.36 and g>.15 and r>g*1.23 and g>b*1.6:selected.add(p.index)
print('LOWER_BILL_FACES',len(selected),flush=True)
assert len(selected)>5
# Boundary of the removed patch becomes the dark inner wall of the mouth.
edges={}
for p in obj.data.polygons:
 if p.index not in selected:continue
 for a,b in p.edge_keys:edges[(min(a,b),max(a,b))]=edges.get((min(a,b),max(a,b)),0)+1
boundary=[e for e,n in edges.items() if n==1]
original=[v.co.copy() for v in obj.data.vertices]
def jawpoint(p,amount=1,rounding=0,wide=0):
 # Hinge is behind the upper bill. Lower tip swings down and slightly back.
 pivot=Vector((-.245,-.86,1.48));q=p-pivot;q=Matrix.Rotation(.48*amount,3,'X')@q;q.z-=.02*amount;q.y-=.045*amount;q.x*=1-.14*rounding+.11*wide;return q+pivot
jaw=obj.copy();jaw.data=obj.data.copy();jaw.name='Nova_LowerBill';bpy.context.collection.objects.link(jaw)
for target,keep in [(jaw,True),(obj,False)]:
 bm=bmesh.new();bm.from_mesh(target.data);bm.faces.ensure_lookup_table();bmesh.ops.delete(bm,geom=[f for f in bm.faces if (f.index in selected)!=keep],context='FACES');bmesh.ops.delete(bm,geom=[v for v in bm.verts if not v.link_faces],context='VERTS');bm.to_mesh(target.data);bm.free();target.data.update()
skin(jaw)
# Close the bill's underside so an open beak never exposes paper-thin triangles.
# A small convex shell uses the source boundary; the full owl remains untouched.
coords=np.array([tuple(v.co) for v in jaw.data.vertices]);lo=coords.min(axis=0);hi=coords.max(axis=0)
bm=bmesh.new();bm.from_mesh(jaw.data);bmesh.ops.convex_hull(bm,input=list(bm.verts),use_existing_faces=False);bm.to_mesh(jaw.data);bm.free();jaw.data.update()
gold=material('Amber lower bill',(.66,.30,.055));jaw.data.materials.clear();jaw.data.materials.append(gold)
for p in jaw.data.polygons:p.material_index=0;p.use_smooth=True
skin(jaw)
for key,amount,rounding,wide in [('Basis',0,0,0),('Beak_Open',1,0,0),('Beak_Round',0,1,0),('Beak_Wide',0,0,1)]:
 sk=jaw.shape_key_add(name=key,from_mix=False);sk.value=0
 if key!='Basis':
  for p,v in zip(sk.data,jaw.data.vertices):p.co=jawpoint(v.co,amount,rounding,wide)
vs=[];fs=[]
for a,b in boundary:
 p=original[a].copy();q=original[b].copy();p.y+=.035;q.y+=.035;start=len(vs);vs.extend([p,q,p,q]);fs.append((start,start+1,start+3,start+2))
mesh=bpy.data.meshes.new('OralWall');mesh.from_pydata(vs,[],fs);mesh.materials.append(oral);o=bpy.data.objects.new('Nova_OralWall',mesh);bpy.context.collection.objects.link(o);skin(o)
for key,amount,rounding,wide in [('Basis',0,0,0),('Beak_Open',1,0,0),('Beak_Round',0,1,0),('Beak_Wide',0,0,1)]:
 sk=o.shape_key_add(name=key,from_mix=False);sk.value=0
 if key!='Basis':
  for i,p in enumerate(sk.data):
   if i%4>=2:p.co=jawpoint(Vector(vs[i]),amount,rounding,wide)
face_objects=lids+lashes+[jaw,o]
# Export contains skinning and portable morphs only; no render handlers/drivers.
bpy.ops.object.select_all(action='DESELECT')
for ob in [obj,arm]+face_objects:ob.select_set(True)
bpy.context.view_layer.objects.active=arm
bpy.ops.wm.save_as_mainfile(filepath=str(out/'nova-v5-rig.blend'))
bpy.ops.export_scene.gltf(filepath=str(out/'nova-v5-rig.glb'),export_format='GLB',use_selection=True,export_animations=True,export_nla_strips=True,export_skins=True,export_morph=True,export_morph_normal=True,export_try_sparse_sk=True,export_image_format='JPEG',export_jpeg_quality=92)
if '--render' not in args: sys.exit(0)
# Lighting / camera for deterministic close-up review frames.
scene=bpy.context.scene
for ob in list(scene.objects):
 if ob.type in {'LIGHT','CAMERA'}:bpy.data.objects.remove(ob,do_unlink=True)
w=bpy.data.worlds.new('FaceWorld');w.use_nodes=True;nodes=w.node_tree.nodes;nodes.clear();bg=nodes.new('ShaderNodeBackground');bg.inputs[0].default_value=(.09,.1,.16,1);bg.inputs[1].default_value=.6;o=nodes.new('ShaderNodeOutputWorld');w.node_tree.links.new(bg.outputs[0],o.inputs[0]);scene.world=w
for name,pos,power,size in [('Key',(-3,-4,5),500,4),('Fill',(4,-2,2),280,4)]:
 d=bpy.data.lights.new(name,'AREA');d.energy=power;d.size=size;l=bpy.data.objects.new(name,d);scene.collection.objects.link(l);l.location=pos;l.rotation_euler=(Vector((-.2,0,1.9))-l.location).to_track_quat('-Z','Y').to_euler()
d=bpy.data.cameras.new('FaceCamera');cam=bpy.data.objects.new('FaceCamera',d);scene.collection.objects.link(cam);cam.location=(-.2,-6,1.9);cam.rotation_euler=(Vector((-.2,0,1.9))-cam.location).to_track_quat('-Z','Y').to_euler();d.type='ORTHO';d.ortho_scale=1.8;scene.camera=cam
scene.render.engine='CYCLES';scene.cycles.samples=8;scene.render.resolution_x=450;scene.render.resolution_y=450;scene.render.resolution_percentage=100;scene.view_settings.view_transform='AgX';scene.render.image_settings.file_format='PNG'
for name,blink,mouth in [('open',0,0),('quarter',.25,0),('half',.5,0),('threequarter',.75,0),('closed',1,0),('mouth',0,1)]:
 for ob in face_objects:
  for sk in list(ob.data.shape_keys.key_blocks)[1:]:sk.value=0
 for lid in lids:
  if blink:lid.data.shape_keys.key_blocks[{.25:'Blink_Quarter',.5:'Blink_Half',.75:'Blink_ThreeQuarter',1:'Blink_Closed'}[blink]].value=1
 for lash in lashes:lash.data.shape_keys.key_blocks['Blink_Closed'].value=1 if blink==1 else 0
 for ob in [jaw,bpy.data.objects['Nova_OralWall']]:ob.data.shape_keys.key_blocks['Beak_Open'].value=mouth
 scene.render.filepath=str(out/(name+'.png'));bpy.ops.render.render(write_still=True)
