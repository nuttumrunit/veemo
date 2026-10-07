import bpy, json, os, datetime
root=os.path.abspath(os.path.join(os.path.dirname(__file__),'..'))
out=os.path.join(root,'artifacts')
os.makedirs(out,exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3,radius=1.2,location=(0,0,0))
core=bpy.context.object
core.name='VeemoCore'
bevel=core.modifiers.new('AgentBevel','BEVEL')
bevel.width=.08
bevel.segments=3
bpy.ops.mesh.primitive_torus_add(major_radius=1.65,minor_radius=.07,major_segments=48,minor_segments=10)
ring=bpy.context.object
ring.name='NetworkRing'
mat=bpy.data.materials.new('VeemoOrange')
mat.diffuse_color=(1.0,.22,.06,1.0)
core.data.materials.append(mat)
ring.data.materials.append(mat)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(out,'veemo_core.blend'))
bpy.ops.export_scene.gltf(filepath=os.path.join(out,'veemo_core.glb'),export_format='GLB',use_selection=False)
state={'agent':'BLENDER-11','status':'complete','task':'generated VeemoCore mesh and NetworkRing','artifact':'artifacts/veemo_core.glb','finishedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'objects':len(bpy.context.scene.objects)}
with open(os.path.join(out,'blender-status.json'),'w',encoding='utf-8') as f:json.dump(state,f,indent=2)
print('VEEMO_AGENT_RESULT '+json.dumps(state))
