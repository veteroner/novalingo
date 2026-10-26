import bpy
from pathlib import Path
from mathutils import Vector

def render_views(out, views):
 out=Path(out);out.mkdir(parents=True,exist_ok=True);scene=bpy.context.scene
 scene.render.engine='CYCLES';scene.cycles.samples=20;scene.render.resolution_x=800;scene.render.resolution_y=900;scene.render.resolution_percentage=100;scene.render.film_transparent=True
 w=bpy.data.worlds.new('PreviewWorld');w.use_nodes=True;n=w.node_tree.nodes;n.clear();bg=n.new('ShaderNodeBackground');bg.inputs[0].default_value=(.26,.27,.32,1);bg.inputs[1].default_value=.55;output=n.new('ShaderNodeOutputWorld');w.node_tree.links.new(bg.outputs[0],output.inputs[0]);scene.world=w
 for name,loc,power,size in [('Key',(-3,-4,5),500,4),('Fill',(4,-2,2),280,4),('Rim',(1,3,4),550,3)]:
  d=bpy.data.lights.new(name,'AREA');d.energy=power;d.shape='DISK';d.size=size;o=bpy.data.objects.new(name,d);scene.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector((0,0,1.5))-o.location).to_track_quat('-Z','Y').to_euler()
 c=bpy.data.cameras.new('PreviewCamera');cam=bpy.data.objects.new('PreviewCamera',c);scene.collection.objects.link(cam);scene.camera=cam;c.type='ORTHO';c.ortho_scale=3.6
 for name,loc in views:
  cam.location=loc;cam.rotation_euler=(Vector((0,0,1.5))-cam.location).to_track_quat('-Z','Y').to_euler();scene.render.filepath=str(out/(name+'.png'));bpy.ops.render.render(write_still=True)
