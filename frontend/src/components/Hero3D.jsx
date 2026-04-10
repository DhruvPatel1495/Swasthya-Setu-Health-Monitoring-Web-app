import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// ─── Story stages ──────────────────────────────────────────────────────────
const STAGES = [
  {
    id: 0,
    label: 'AI Monitoring Active',
    sub: 'Your vitals are being tracked in real‑time',
    color: 0x00f2fe,
    emissive: 0x00b4d8,
    speed: 0.4,
  },
  {
    id: 1,
    label: 'Running Diagnostics',
    sub: 'AI is analysing your health patterns',
    color: 0x8b5cf6,
    emissive: 0x6d28d9,
    speed: 0.9,
  },
  {
    id: 2,
    label: 'Report Ready',
    sub: 'Personalised insights generated for you',
    color: 0x22c55e,
    emissive: 0x15803d,
    speed: 0.3,
  },
];

const METRICS = [
  { label: 'HR', value: '72 bpm', angle: 0.8 },
  { label: 'SpO₂', value: '98 %', angle: 2.5 },
  { label: 'BP', value: '118/76', angle: 4.2 },
  { label: 'Temp', value: '36.6°C', angle: 5.8 },
];

// lerp helper
const lerp = (a, b, t) => a + (b - a) * t;

const Hero3D = () => {
  const mountRef = useRef(null);
  const stateRef = useRef({
    mouse: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    hovering: false,
    hoverStrength: 0,   // 0 → 1
    stageIdx: 0,
    stageT: 0,          // time within stage
    ripples: [],        // [{scale, opacity}]
  });
  const [stageIdx, setStageIdx] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [metricPos, setMetricPos] = useState(METRICS.map(() => ({ x: 0, y: 0, visible: false })));

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ── Renderer ──────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // ── Scene / Camera ───────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.z = 5;

    // ── Lights ───────────────────────────────────────────────────────
    const ambient = new THREE.AmbientLight(0x050510, 4);
    scene.add(ambient);
    const frontLight = new THREE.PointLight(0x00f2fe, 10, 15);
    frontLight.position.set(2, 2, 4);
    scene.add(frontLight);
    const backLight = new THREE.PointLight(0x8b5cf6, 6, 15);
    backLight.position.set(-3, -2, -2);
    scene.add(backLight);
    const rimLight = new THREE.PointLight(0x22c55e, 3, 10);
    rimLight.position.set(0, 4, -3);
    scene.add(rimLight);

    // ── Core orb ─────────────────────────────────────────────────────
    const orbGeo = new THREE.SphereGeometry(1.2, 128, 128);
    const orbMat = new THREE.MeshStandardMaterial({
      color: 0x050e1f,
      emissive: 0x00b4d8,
      emissiveIntensity: 0.4,
      metalness: 0.7,
      roughness: 0.15,
    });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    scene.add(orb);

    // ── Glow shell ───────────────────────────────────────────────────
    const glowGeo = new THREE.SphereGeometry(1.38, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe, transparent: true, opacity: 0.08, side: THREE.BackSide,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    scene.add(glowMesh);

    // ── ECG ring ─────────────────────────────────────────────────────
    const makeECGRing = (radius, color) => {
      const pts = [];
      for (let i = 0; i <= 220; i++) {
        const pct = i / 220;
        const angle = pct * Math.PI * 2;
        let spike = 0;
        if (pct > 0.27 && pct < 0.275) spike = 0.15;
        else if (pct > 0.275 && pct < 0.285) spike = -0.07;
        else if (pct > 0.285 && pct < 0.295) spike = 0.42;
        else if (pct > 0.295 && pct < 0.305) spike = -0.14;
        else if (pct > 0.305 && pct < 0.31) spike = 0.08;
        pts.push(new THREE.Vector3(
          (radius + spike) * Math.cos(angle),
          (radius + spike) * Math.sin(angle),
          0,
        ));
      }
      const curve = new THREE.CatmullRomCurve3(pts, true);
      const geo = new THREE.TubeGeometry(curve, 300, 0.009, 8, true);
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = Math.PI / 2;
      scene.add(mesh);
      return mesh;
    };
    const ecgRing = makeECGRing(1.58, 0x00f2fe);

    // ── Orbit rings ───────────────────────────────────────────────────
    const makeRing = (r, color, rx, rz, opacity = 0.35) => {
      const g = new THREE.TorusGeometry(r, 0.006, 8, 120);
      const m = new THREE.MeshBasicMaterial({ color, transparent: true, opacity });
      const mesh = new THREE.Mesh(g, m);
      mesh.rotation.x = rx;
      mesh.rotation.z = rz;
      scene.add(mesh);
      return mesh;
    };
    const ring1 = makeRing(1.78, 0x8b5cf6, Math.PI / 3, Math.PI / 6);
    const ring2 = makeRing(2.05, 0x00f2fe, Math.PI / 5, -Math.PI / 4, 0.12);

    // ── Particles ─────────────────────────────────────────────────────
    const N = 250;
    const basePos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.2 + Math.random() * 1.8;
      basePos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      basePos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      basePos[i * 3 + 2] = r * Math.cos(phi);
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(basePos.slice(), 3));
    const pMat = new THREE.PointsMaterial({ color: 0x00f2fe, size: 0.028, transparent: true, opacity: 0.6, sizeAttenuation: true });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // ── Travelling dot ────────────────────────────────────────────────
    const dotGeo = new THREE.SphereGeometry(0.05, 16, 16);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const dot = new THREE.Mesh(dotGeo, dotMat);
    scene.add(dot);

    // ── Ripple rings ──────────────────────────────────────────────────
    const rippleMeshes = [];
    const MAX_RIPPLES = 4;
    for (let i = 0; i < MAX_RIPPLES; i++) {
      const rg = new THREE.TorusGeometry(1.2, 0.004, 8, 80);
      const rm = new THREE.MeshBasicMaterial({ color: 0x00f2fe, transparent: true, opacity: 0 });
      const rmesh = new THREE.Mesh(rg, rm);
      scene.add(rmesh);
      rippleMeshes.push({ mesh: rmesh, active: false, progress: 0 });
    }

    // fire a ripple
    const fireRipple = () => {
      const r = rippleMeshes.find(r => !r.active);
      if (r) { r.active = true; r.progress = 0; }
    };

    // ── Metric node 3D positions ──────────────────────────────────────
    const orbitR = 2.2;
    const metricNodes = METRICS.map((m, i) => {
      const g = new THREE.SphereGeometry(0.06, 12, 12);
      const mat = new THREE.MeshBasicMaterial({ color: 0x00f2fe, transparent: true, opacity: 0 });
      const mesh = new THREE.Mesh(g, mat);
      const ang = m.angle;
      mesh.position.set(orbitR * Math.cos(ang), 0.5 * Math.sin(i * 1.3), orbitR * Math.sin(ang));
      scene.add(mesh);
      return { mesh, mat, baseAngle: ang, idx: i };
    });

    // ── Mouse events on the canvas ──────────────────────────────────
    const s = stateRef.current;
    const onMove = (e) => {
      const rect = mount.getBoundingClientRect();
      s.mouse.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      s.mouse.y = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    const onEnter = () => { s.hovering = true; setHovered(true); fireRipple(); };
    const onLeave = () => { s.hovering = false; setHovered(false); s.mouse.x = 0; s.mouse.y = 0; };
    const onClick = () => { fireRipple(); fireRipple(); };

    mount.addEventListener('mousemove', onMove);
    mount.addEventListener('mouseenter', onEnter);
    mount.addEventListener('mouseleave', onLeave);
    mount.addEventListener('click', onClick);

    // ── Resize ───────────────────────────────────────────────────────
    const onResize = () => {
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    // ── Stage auto-advance ────────────────────────────────────────────
    let stageTimer = setTimeout(function advance() {
      s.stageIdx = (s.stageIdx + 1) % STAGES.length;
      setStageIdx(s.stageIdx);
      fireRipple();
      stageTimer = setTimeout(advance, 3500);
    }, 3500);

    // ── Animation loop ────────────────────────────────────────────────
    let animId;
    let t = 0;
    const v3 = new THREE.Vector3();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.008;

      // hover strength lerp
      s.hoverStrength = lerp(s.hoverStrength, s.hovering ? 1 : 0, 0.07);
      const hs = s.hoverStrength;

      // smooth mouse
      s.target.x = lerp(s.target.x, s.mouse.x, 0.08);
      s.target.y = lerp(s.target.y, s.mouse.y, 0.08);

      const stage = STAGES[s.stageIdx];

      // ── Orb ──
      // Idle: slow drift; hover: strong tilt toward cursor
      const idleTiltX = Math.sin(t * 0.4) * 0.08;
      const idleTiltY = Math.cos(t * 0.3) * 0.08;
      orb.rotation.y = lerp(t * 0.12 + idleTiltY, t * 0.12 + s.target.x * 1.2, hs);
      orb.rotation.x = lerp(idleTiltX, s.target.y * 1.0, hs);

      // emissive color & intensity
      const targetEmissive = new THREE.Color(stage.emissive);
      orbMat.emissive.lerp(targetEmissive, 0.04);
      orbMat.emissiveIntensity = lerp(0.35 + 0.1 * Math.sin(t * 2), 1.2, hs);

      // ── Glow ──
      glowMesh.rotation.y = orb.rotation.y * 0.6;
      const targetGlowColor = new THREE.Color(stage.color);
      glowMat.color.lerp(targetGlowColor, 0.04);
      glowMat.opacity = lerp(0.06 + 0.04 * Math.sin(t * 2.5), 0.25, hs);

      // ── Lights ──
      frontLight.intensity = lerp(8 + 3 * Math.sin(t * 2), 22, hs);
      new THREE.Color(stage.color).toArray(v3);
      frontLight.color.lerp(new THREE.Color(stage.color), 0.04);

      // ── ECG ring ──
      const ecgSpeed = lerp(stage.speed, stage.speed * 2.5, hs);
      ecgRing.rotation.z = t * ecgSpeed;
      ecgRing.material.color.lerp(new THREE.Color(stage.color), 0.05);
      ecgRing.material.opacity = lerp(0.8, 1.0, hs);

      // ── Orbit rings ──
      ring1.rotation.z += lerp(0.002, 0.006, hs);
      ring2.rotation.z -= lerp(0.0015, 0.005, hs);
      ring1.material.opacity = lerp(0.3, 0.7, hs);
      ring2.material.opacity = lerp(0.1, 0.4, hs);
      ring1.material.color.lerp(new THREE.Color(stage.color), 0.04);

      // ── Particles ──
      const pArr = pGeo.attributes.position.array;
      for (let i = 0; i < N; i++) {
        const bx = basePos[i * 3], by = basePos[i * 3 + 1], bz = basePos[i * 3 + 2];
        // on hover, suck particles slightly inward
        const dist = Math.sqrt(bx * bx + by * by + bz * bz);
        const pullFactor = 1 - hs * 0.25;
        pArr[i * 3] = lerp(bx, bx * pullFactor, hs) + Math.sin(t * 0.3 + i) * 0.01;
        pArr[i * 3 + 1] = lerp(by, by * pullFactor, hs) + Math.cos(t * 0.25 + i) * 0.01;
        pArr[i * 3 + 2] = lerp(bz, bz * pullFactor, hs);
      }
      pGeo.attributes.position.needsUpdate = true;
      particles.rotation.y = t * 0.04;
      pMat.opacity = lerp(0.5, 0.9, hs);
      pMat.size = lerp(0.028, 0.04, hs);
      pMat.color.lerp(new THREE.Color(stage.color), 0.04);

      // ── Travelling dot ──
      const dotAngle = (t * lerp(0.8, 2.0, hs)) % (Math.PI * 2);
      const dotR = 1.58;
      const rotated = new THREE.Vector3(dotR * Math.cos(dotAngle), 0, dotR * Math.sin(dotAngle))
        .applyEuler(new THREE.Euler(Math.PI / 2, 0, ecgRing.rotation.z));
      dot.position.copy(rotated);
      dot.scale.setScalar(lerp(1, 1.8, hs));

      // ── Ripple rings ──
      rippleMeshes.forEach(r => {
        if (!r.active) return;
        r.progress += 0.025;
        const s2 = 1 + r.progress * 2.5;
        r.mesh.scale.setScalar(s2);
        r.mesh.material.opacity = Math.max(0, 0.6 * (1 - r.progress));
        r.mesh.material.color.lerp(new THREE.Color(stage.color), 0.1);
        if (r.progress >= 1) { r.active = false; r.progress = 0; r.mesh.material.opacity = 0; }
      });

      // ── Metric nodes + project to screen ──
      const newPos = metricNodes.map((node, i) => {
        const ang = node.baseAngle + t * lerp(0.08, 0.25, hs);
        node.mesh.position.x = orbitR * Math.cos(ang);
        node.mesh.position.z = orbitR * Math.sin(ang);
        node.mesh.position.y = lerp(-0.3, 0.4, 0.5 + 0.5 * Math.sin(t * 0.5 + i));
        node.mat.opacity = lerp(0, 0.9, hs);

        // project 3D → 2D
        const vec = node.mesh.position.clone().project(camera);
        const x = (vec.x + 1) / 2 * 100;
        const y = (-vec.y + 1) / 2 * 100;
        return { x, y, visible: hs > 0.05 };
      });
      setMetricPos(newPos);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(stageTimer);
      mount.removeEventListener('mousemove', onMove);
      mount.removeEventListener('mouseenter', onEnter);
      mount.removeEventListener('mouseleave', onLeave);
      mount.removeEventListener('click', onClick);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  const stage = STAGES[stageIdx];

  return (
    <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'relative', cursor: 'default' }}>
      {/* Stage label overlay */}
      <div style={{
        position: 'absolute', bottom: '12%', left: '50%', transform: 'translateX(-50%)',
        textAlign: 'center', pointerEvents: 'none', transition: 'opacity 0.6s',
        opacity: 1,
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 999, padding: '6px 18px', backdropFilter: 'blur(8px)',
          marginBottom: 6,
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%', display: 'inline-block',
            background: `#${stage.color.toString(16).padStart(6, '0')}`,
            boxShadow: `0 0 8px #${stage.color.toString(16).padStart(6, '0')}`,
            animation: 'pulse3d 1.4s ease-in-out infinite',
          }} />
          <span style={{ color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>
            {stage.label}
          </span>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>{stage.sub}</div>
      </div>

      {/* Hover hint */}
      {!hovered && (
        <div style={{
          position: 'absolute', top: '8%', left: '50%', transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.3)', fontSize: 11, pointerEvents: 'none',
          letterSpacing: 2, textTransform: 'uppercase',
          animation: 'floatHint 2s ease-in-out infinite',
        }}>
          ↑ hover to interact
        </div>
      )}

      {/* Floating metric nodes (HTML overlay) */}
      {METRICS.map((m, i) => (
        <div key={m.label} style={{
          position: 'absolute',
          left: `${metricPos[i]?.x}%`,
          top: `${metricPos[i]?.y}%`,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          opacity: metricPos[i]?.visible ? 1 : 0,
          transition: 'opacity 0.4s',
        }}>
          <div style={{
            background: 'rgba(0,242,254,0.08)',
            border: '1px solid rgba(0,242,254,0.3)',
            borderRadius: 10, padding: '5px 12px',
            backdropFilter: 'blur(6px)',
            textAlign: 'center', minWidth: 64,
          }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase' }}>{m.label}</div>
            <div style={{ color: '#00f2fe', fontWeight: 700, fontSize: 13 }}>{m.value}</div>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes pulse3d {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.6; }
        }
        @keyframes floatHint {
          0%, 100% { transform: translateX(-50%) translateY(0); opacity: 0.3; }
          50% { transform: translateX(-50%) translateY(-6px); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};

export default Hero3D;

