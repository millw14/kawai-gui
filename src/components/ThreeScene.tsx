import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { VRMLoaderPlugin } from '@pixiv/three-vrm';

const ThreeScene: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0x000000, 0);
        containerRef.current.appendChild(renderer.domElement);

        // Camera
        const camera = new THREE.PerspectiveCamera(30.0, window.innerWidth / window.innerHeight, 0.1, 20.0);
        camera.position.set(0.4, 1.4, 3.5);

        // Scene
        const scene = new THREE.Scene();

        // Light
        const light = new THREE.DirectionalLight(0xffffff);
        light.position.set(1.0, 1.0, 1.0).normalize();
        scene.add(light);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        // VRM Loader
        let currentVrm: any = null;
        let mixer: THREE.AnimationMixer | null = null;
        const loader = new GLTFLoader();
        loader.register((parser) => {
            return new VRMLoaderPlugin(parser);
        });

        const vrmUrl = '/kawai-chan.vrm';
        const animationUrl = '/Idle.fbx';

        // Mixamo to VRM Bone Mapping
        const mixamoVRMBoneMap: { [key: string]: string } = {
            mixamorigHips: 'hips',
            mixamorigSpine: 'spine',
            mixamorigSpine1: 'chest',
            mixamorigSpine2: 'upperChest',
            mixamorigNeck: 'neck',
            mixamorigHead: 'head',
            mixamorigLeftShoulder: 'leftShoulder',
            mixamorigLeftArm: 'leftUpperArm',
            mixamorigLeftForeArm: 'leftLowerArm',
            mixamorigLeftHand: 'leftHand',
            mixamorigRightShoulder: 'rightShoulder',
            mixamorigRightArm: 'rightUpperArm',
            mixamorigRightForeArm: 'rightLowerArm',
            mixamorigRightHand: 'rightHand',
            mixamorigLeftUpLeg: 'leftUpperLeg',
            mixamorigLeftLeg: 'leftLowerLeg',
            mixamorigLeftFoot: 'leftFoot',
            mixamorigLeftToeBase: 'leftToes',
            mixamorigRightUpLeg: 'rightUpperLeg',
            mixamorigRightLeg: 'rightLowerLeg',
            mixamorigRightFoot: 'rightFoot',
            mixamorigRightToeBase: 'rightToes',
        };

        const loadFBXAnimation = (url: string, vrm: any) => {
            const fbxLoader = new FBXLoader();
            fbxLoader.load(url, (fbx) => {
                const clip = fbx.animations[0];
                if (!clip) return;

                // Create a new clip for VRM humanoid bones
                const tracks: THREE.KeyframeTrack[] = [];

                clip.tracks.forEach((track) => {
                    const trackName = track.name;
                    // Example trackName: "mixamorigHips.position"
                    const parts = trackName.split('.');
                    const mixamoBoneName = parts[0];
                    const propertyName = parts[1];

                    const vrmBoneName = mixamoVRMBoneMap[mixamoBoneName];
                    if (vrmBoneName) {
                        const boneNode = vrm.humanoid.getNormalizedBoneNode(vrmBoneName);
                        if (boneNode) {
                            // Map to the VRM bone name in the track
                            const newTrackName = `${boneNode.name}.${propertyName}`;
                            if (track instanceof THREE.QuaternionKeyframeTrack) {
                                tracks.push(new THREE.QuaternionKeyframeTrack(newTrackName, track.times, track.values));
                            } else if (track instanceof THREE.VectorKeyframeTrack) {
                                tracks.push(new THREE.VectorKeyframeTrack(newTrackName, track.times, track.values));
                            }
                        }
                    }
                });

                const vrmClip = new THREE.AnimationClip('vrmIdle', clip.duration, tracks);
                mixer = new THREE.AnimationMixer(vrm.scene);
                const action = mixer.clipAction(vrmClip);
                action.play();
                console.log('Animation playing');
            });
        };

        loader.load(
            vrmUrl,
            (gltf) => {
                const vrm = gltf.userData.vrm;
                vrm.scene.position.set(0.8, 0, 0);
                vrm.scene.rotation.y = 0;
                scene.add(vrm.scene);
                currentVrm = vrm;

                if (vrm.expressionManager) {
                    vrm.expressionManager.setValue('relaxed', 1.0);
                }

                // Load and retarget animation
                loadFBXAnimation(animationUrl, vrm);

                // Auto-blink
                if (vrm.expressionManager) {
                    setInterval(() => {
                        vrm.expressionManager.setValue('blink', 1.0);
                        setTimeout(() => vrm.expressionManager.setValue('blink', 0.0), 100);
                    }, 4000);
                }

                console.log('VRM Loaded', vrm);
            },
            (progress) => console.log('Loading VRM...', 100.0 * (progress.loaded / progress.total), '%'),
            (error) => console.error(error)
        );

        // Interaction
        const mouse = new THREE.Vector2();
        const onMouseMove = (event: MouseEvent) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', onMouseMove);

        const onResize = () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        };
        window.addEventListener('resize', onResize);

        // Animate
        const clock = new THREE.Clock();
        const animate = () => {
            requestAnimationFrame(animate);
            const deltaTime = clock.getDelta();

            if (mixer) {
                mixer.update(deltaTime);
            }

            if (currentVrm) {
                // Head tracking (additive after animation mixer)
                if (currentVrm.humanoid) {
                    const head = currentVrm.humanoid.getNormalizedBoneNode('head');
                    if (head) {
                        head.rotation.y += THREE.MathUtils.lerp(0, mouse.x * 0.4, 0.1);
                        head.rotation.x += THREE.MathUtils.lerp(0, -mouse.y * 0.2, 0.1);
                    }
                }
                currentVrm.update(deltaTime);
            }

            renderer.render(scene, camera);
        };
        animate();

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('resize', onResize);
            renderer.dispose();
            if (containerRef.current) {
                containerRef.current.removeChild(renderer.domElement);
            }
        };
    }, []);

    return <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 1 }} />;
};

export default ThreeScene;
