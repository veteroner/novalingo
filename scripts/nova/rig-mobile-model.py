# Run with Blender --background --python <this-file> -- <normalized-static.blend> <output-dir>
import bpy,math,json,sys
from pathlib import Path
from mathutils import Vector
args=sys.argv[sys.argv.index('--')+1:];source=Path(args[0]);out=Path(args[1]);out.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(source))
obj=bpy.data.objects['GEO-Nova'];obj.name='Nova_Feathers';obj.data.name='Nova_Mobile80k'
def smooth(a,b,x):
 t=max(0,min(1,(x-a)/(b-a)));return t*t*(3-2*t)
# A small deform rig authored locally; source mesh and UVs stay intact.
bpy.ops.object.armature_add(enter_editmode=True,location=(0,0,0));arm=bpy.context.object;arm.name='Nova_Rig';bones=arm.data.edit_bones;bones.remove(bones[0])
def bone(name,p,tail,parent=None):
 b=bones.new(name);b.head=p;b.tail=tail
 if parent:b.parent=bones[parent]
 return b
bone('Root',(0,0,0),(0,0,.3))
bone('Body',(0,0,.3),(0,0,1.35),'Root')
bone('Head',(-.12,-.05,1.45),(-.12,-.05,2.2),'Body')
bone('Wing_L',(-.62,.02,1.25),(-.62,.02,.65),'Body')
bone('Wing_R',(.62,.02,1.25),(.62,.02,.65),'Body')
bpy.ops.object.mode_set(mode='OBJECT')
groups={name:obj.vertex_groups.new(name=name) for name in ['Root','Body','Head','Wing_L','Wing_R']}
for v in obj.data.vertices:
 x,y,z=v.co
 head=smooth(1.32,1.58,z)
 feet=1-smooth(.12,.32,z)
 wing=smooth(.43,.79,abs(x))*(1-smooth(1.1,1.48,z))*smooth(.22,.5,z)
 wing=min(wing,(1-head)*(1-feet))
 weights={'Root':feet,'Head':head*(1-feet),'Wing_L':wing if x<0 else 0,'Wing_R':wing if x>=0 else 0}
 weights['Body']=max(0,1-sum(weights.values()));total=sum(weights.values())
 for name,w in weights.items():
  if w>.00001:groups[name].add([v.index],w/total,'REPLACE')
mod=obj.modifiers.new('Nova_Deform','ARMATURE');mod.object=arm;obj.parent=arm
basis=obj.shape_key_add(name='Basis',from_mix=False)
original=[v.co.copy() for v in basis.data]
key=obj.shape_key_add(name='Beak_Open',from_mix=False);key.value=0
for i,p in enumerate(original):
 x,y,z=p
 r=math.sqrt(((x+.30)/.145)**2+((z-1.37)/.125)**2)
 w=(1-smooth(.5,1.05,r))*(1-smooth(-.99,-.90,y))
 key.data[i].co=(x,y+.018*w,z-.055*w)
obj.active_shape_key_index=0;obj.show_only_shape_key=False
# Reusable clips in the .blend and GLB; runtime also drives controls from app events.
scene=bpy.context.scene;scene.render.fps=30
for name,seconds in [('Idle',4),('Listen',2),('Think',3),('Encourage',2),('Celebrate',2)]:
 arm.animation_data_create();action=bpy.data.actions.new(name);arm.animation_data.action=action
 for frame in [1,1+int(seconds*15),1+int(seconds*30)]:
  middle=frame==1+int(seconds*15)
  for p in arm.pose.bones:p.rotation_mode='XYZ';p.rotation_euler=(0,0,0);p.scale=(1,1,1)
  if middle:
   arm.pose.bones['Head'].rotation_euler=(.035 if name=='Idle' else .07,0,.11 if name in ['Think','Listen'] else -.035)
   if name in ['Encourage','Celebrate']:arm.pose.bones['Wing_R'].rotation_euler.z=.26
   if name=='Celebrate':arm.pose.bones['Wing_L'].rotation_euler.z=-.18
   arm.pose.bones['Body'].scale.y=1.008
  for p in arm.pose.bones:
   p.keyframe_insert('rotation_euler',frame=frame);p.keyframe_insert('scale',frame=frame)
 track=arm.animation_data.nla_tracks.new();track.name=name;track.strips.new(name,1,action);arm.animation_data.action=None;track.mute=True
for p in arm.pose.bones:p.rotation_euler=(0,0,0);p.scale=(1,1,1)
scene.frame_set(1)
bpy.ops.object.select_all(action='DESELECT');obj.select_set(True);arm.select_set(True);bpy.context.view_layer.objects.active=arm
bpy.ops.wm.save_as_mainfile(filepath=str(out/'nova-v4-rig.blend'))
bpy.ops.export_scene.gltf(filepath=str(out/'nova-v4-rig.glb'),export_format='GLB',use_selection=True,export_animations=True,export_nla_strips=True,export_skins=True,export_morph=True,export_morph_normal=False,export_image_format='JPEG',export_jpeg_quality=92)
print('RIG_REPORT',json.dumps({'bones':len(arm.data.bones),'shape_keys':[k.name for k in obj.data.shape_keys.key_blocks],'triangles':len(obj.data.polygons),'glb_bytes':(out/'nova-v4-rig.glb').stat().st_size}))
