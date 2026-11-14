"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { Scenario } from "@/lib/scenario";
import { modelScenario } from "@/lib/scenario";
import CanvasFlame from "./canvas-flame";
const vertex = `varying vec3 vPosition; void main(){vPosition=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const fragment = `precision highp float;
varying vec3 vPosition;
uniform float uTime,uActivity,uGravity,uFlow,uFuel;uniform vec3 uCamera;
float hash(vec3 p){p=fract(p*.3183099+vec3(.1,.2,.3));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float noise(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){return noise(p)*.55+noise(p*2.03)*.27+noise(p*4.01)*.13+noise(p*8.1)*.05;}
vec2 intersectBox(vec3 o,vec3 d){vec3 t0=(-vec3(1.65,1.85,1.65)-o)/d,t1=(vec3(1.65,1.85,1.65)-o)/d;vec3 tmin=min(t0,t1),tmax=max(t0,t1);return vec2(max(max(tmin.x,tmin.y),tmin.z),min(min(tmax.x,tmax.y),tmax.z));}
void main(){vec3 ray=normalize(vPosition-uCamera);vec2 bounds=intersectBox(uCamera,ray);float t=max(0.,bounds.x);float dt=(bounds.y-t)/72.;vec4 sum=vec4(0.);
for(int i=0;i<72;i++){vec3 p=uCamera+ray*(t+dt*(float(i)+.5));float g=sqrt(uGravity);float r=.62+uActivity*.4;
vec3 advect=p*3.8+vec3(sin(uTime*.7)*.4,-uTime*(.65+g*1.2),cos(uTime*.6)*.4);
float turbulent=fbm(advect+vec3(noise(p*2.+uTime*.35))*.8);
vec3 q=p;q.x-=uFlow*.008*p.y;q.y+=.08;
float sphere=length(q)-(r+(turbulent-.5)*.42);
float h=clamp((p.y+.9)/2.6,0.,1.);float curl=sin(h*8.-uTime*3.)*.18*h;
float plumeR=(.52+uActivity*.2)*pow(1.-h,.72);
float plume=length(vec2(p.x-curl-uFlow*.005*h,p.z))-(plumeR+(turbulent-.5)*.35);
float field=mix(sphere,plume,g);
float shell=exp(-pow(field*13.,2.));float core=exp(-pow(max(0.,field+.22)*9.,2.))*.16;
float streak=smoothstep(.25,.75,turbulent);
float density=(shell*(.12+streak*2.5)+core)*(.42+uActivity*.65);
density*=mix(1.,smoothstep(-1.,-.8,p.y)*(1.-smoothstep(1.3,1.8,p.y)),g);
density*=(1.-smoothstep(1.4,1.8,abs(p.y)));
vec3 blue=mix(vec3(.04,.15,.7),vec3(.22,.75,1.),streak);
vec3 hot=mix(vec3(1.,.12,.015),vec3(1.,.78,.32),streak*(1.-h*.6));
float heat=clamp(g*1.4-.15,0.,1.)*smoothstep(-.9,-.5,p.y);
vec3 col=mix(blue,hot,heat);float alpha=1.-exp(-density*dt*2.5);
sum.rgb+=(1.-sum.a)*col*alpha*2.3;sum.a+=(1.-sum.a)*alpha;if(sum.a>.98)break;}
gl_FragColor=vec4(sum.rgb,sum.a);}`;
export default function FlameScene({
  scenario,
  paused = false,
  wireframe = false,
  resetKey = 0,
  activityOverride,
  speed = 1,
}: {
  scenario: Scenario;
  paused?: boolean;
  wireframe?: boolean;
  resetKey?: number;
  activityOverride?: number;
  speed?: number;
}) {
  const container = useRef<HTMLDivElement>(null);
  const sceneState = useRef<{
    uniforms: Record<string, THREE.IUniform>;
    wire: THREE.LineSegments;
    controls: OrbitControls;
    camera: THREE.PerspectiveCamera;
  } | null>(null);
  const pausedRef = useRef(paused);
  const speedRef = useRef(speed);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);
  useEffect(() => {
    const state = sceneState.current;
    if (!state) return;
    const model = modelScenario(scenario);
    state.uniforms.uActivity.value = activityOverride ?? model.activity;
    state.uniforms.uGravity.value = model.gravity;
    state.uniforms.uFlow.value = scenario.airflow;
    state.uniforms.uFuel.value = scenario.fuel === "droplet" ? 0 : 1;
    state.wire.visible = wireframe;
  }, [scenario, wireframe, activityOverride]);
  useEffect(() => {
    const state = sceneState.current;
    if (state) {
      state.camera.position.set(3.2, 1.6, 4.2);
      state.controls.target.set(0, 0, 0);
      state.controls.update();
    }
  }, [resetKey]);
  useEffect(() => {
    const el = container.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("webgl2", {
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
      if (!context) {
        setFailed(true);
        return;
      }
      renderer = new THREE.WebGLRenderer({
        canvas,
        context,
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
    } catch {
      setFailed(true);
      return;
    }
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(3.2, 1.6, 4.2);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 3.5;
    controls.maxDistance = 10;
    controls.maxPolarAngle = Math.PI * 0.82;
    controls.target.set(0, 0, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.setClearColor(0x15201f, 0);
    el.appendChild(renderer.domElement);
    const model = modelScenario(scenario);
    const uniforms = {
      uTime: { value: 0 },
      uActivity: { value: activityOverride ?? model.activity },
      uGravity: { value: model.gravity },
      uFlow: { value: scenario.airflow },
      uFuel: { value: scenario.fuel === "droplet" ? 0 : 1 },
      uCamera: { value: camera.position },
    };
    const box = new THREE.BoxGeometry(3.3, 3.7, 3.3);
    const material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms,
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
    });
    const flame = new THREE.Mesh(box, material);
    scene.add(flame);
    const grid = new THREE.GridHelper(8, 32, 0x3c5753, 0x223c38);
    grid.position.y = -1.45;
    scene.add(grid);
    const wire = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(2.8, 2.9, 2.8)),
      new THREE.LineBasicMaterial({
        color: 0x5e9b8f,
        transparent: true,
        opacity: 0.25,
      }),
    );
    wire.visible = wireframe;
    scene.add(wire);
    const rings: THREE.Line[] = [];
    for (let j = 0; j < 3; j++) {
      const points = [];
      for (let i = 0; i <= 120; i++) {
        const a = (i / 120) * Math.PI * 2;
        const radius = 1.45 + j * 0.22;
        points.push(
          new THREE.Vector3(Math.cos(a) * radius, -1.4, Math.sin(a) * radius),
        );
      }
      const ring = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({
          color: 0x90b8a8,
          transparent: true,
          opacity: 0.16 - j * 0.025,
        }),
      );
      scene.add(ring);
      rings.push(ring);
    }
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.27, 0.32, 0.1, 48),
      new THREE.MeshBasicMaterial({ color: 0x364d47 }),
    );
    base.position.y = -1.38;
    scene.add(base);
    const stalk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, 0.46, 10),
      new THREE.MeshBasicMaterial({ color: 0x78948a }),
    );
    stalk.position.y = -1.1;
    scene.add(stalk);
    const ambientParticles = new Float32Array(120 * 3);
    for (let i = 0; i < 120; i++) {
      ambientParticles[i * 3] = Math.sin(i * 127.1) * 4;
      ambientParticles[i * 3 + 1] = Math.cos(i * 311.7) * 2;
      ambientParticles[i * 3 + 2] = Math.sin(i * 74.7) * 4;
    }
    const pg = new THREE.BufferGeometry();
    pg.setAttribute("position", new THREE.BufferAttribute(ambientParticles, 3));
    const particles = new THREE.Points(
      pg,
      new THREE.PointsMaterial({
        color: 0x8db1a5,
        size: 0.012,
        transparent: true,
        opacity: 0.35,
      }),
    );
    scene.add(particles);
    sceneState.current = { uniforms, wire, controls, camera };
    const resize = () => {
      const w = el.clientWidth,
        h = el.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    let frame = 0,
      last = performance.now(),
      time = 0;
    const animate = (now: number) => {
      frame = requestAnimationFrame(animate);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!pausedRef.current && document.visibilityState === "visible")
        time += dt * speedRef.current;
      uniforms.uTime.value = time;
      controls.update();
      uniforms.uCamera.value = camera.position;
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(animate);
    const lost = (e: Event) => {
      e.preventDefault();
      setFailed(true);
    };
    renderer.domElement.addEventListener("webglcontextlost", lost);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      controls.dispose();
      scene.traverse((obj) => {
        if (
          obj instanceof THREE.Mesh ||
          obj instanceof THREE.Line ||
          obj instanceof THREE.Points
        ) {
          obj.geometry.dispose();
          const mats = Array.isArray(obj.material)
            ? obj.material
            : [obj.material];
          mats.forEach((m) => m.dispose());
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
      sceneState.current = null;
    };
    // One renderer per mounted scene; parameter changes update its uniforms above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div
      className="scene-canvas"
      ref={container}
      role="img"
      aria-label={
        activityOverride !== undefined
          ? `Illustrative 3D encoding of a published spread-rate observation at ${scenario.airflow} centimeters per second airflow. Geometry is not reconstructed. Drag to rotate; scroll to zoom.`
          : `Interactive illustrative ${scenario.gravity} flame at ${scenario.oxygen} percent oxygen and ${scenario.airflow} centimeters per second airflow. Drag to rotate; scroll to zoom.`
      }
    >
      {failed && (
        <CanvasFlame
          scenario={scenario}
          paused={paused}
          wireframe={wireframe}
          resetKey={resetKey}
          activityOverride={activityOverride}
          speed={speed}
        />
      )}
    </div>
  );
}
