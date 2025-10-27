window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('viewer');
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1e1e2f);

  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 10000);
  camera.position.set(0, 0, 200);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  container.appendChild(renderer.domElement);

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  scene.add(new THREE.AmbientLight(0x666666));
  const dl1 = new THREE.DirectionalLight(0xffffff, 1); dl1.position.set(1, 1, 1); scene.add(dl1);
  const dl2 = new THREE.DirectionalLight(0xffffff, 0.5); dl2.position.set(-1, -1, -1); scene.add(dl2);
  scene.add(new THREE.AxesHelper(50));

  let mesh;
  const clipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);

  // Load STL (filename is templated from Flask)
  new THREE.STLLoader().load(
    `/uploads/{{ filename }}`,
    geometry => {
      mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
        color: 0x00aaff,
        metalness: 0.2,
        roughness: 0.6,
        clippingPlanes: [clipPlane],
        clipIntersection: true
      }));
      geometry.computeBoundingBox();
      geometry.center();
      const diag = geometry.boundingBox.getSize(new THREE.Vector3()).length();
      mesh.scale.setScalar(100 / diag);

      // Center camera and controls
      const box = new THREE.Box3().setFromObject(mesh);
      const center = box.getCenter(new THREE.Vector3());
      controls.target.copy(center);
      camera.position.copy(center).add(new THREE.Vector3(0, 0, box.getSize(new THREE.Vector3()).length() * 1.5));
      controls.update();

      scene.add(mesh);
    }
  );

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
});
