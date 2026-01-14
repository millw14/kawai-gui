import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { VRMLoaderPlugin } from '@pixiv/three-vrm';
import './GuideCharacter.css';

const GUIDE_MESSAGES = [
    "Welcome to my PC simulation! 💕",
    "Double-click icons to open apps~",
    "Try the VS Code to see some code!",
    "The browser has cool pages inside 🌐",
    "Don't forget to check out the games! 🎮",
    "You can drag windows around~",
    "Click me for more tips! ✨",
];

const GuideCharacter: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [message, setMessage] = useState(GUIDE_MESSAGES[0]);
    const [showBubble, setShowBubble] = useState(true);
    const [messageIndex, setMessageIndex] = useState(0);

    const nextMessage = () => {
        const next = (messageIndex + 1) % GUIDE_MESSAGES.length;
        setMessageIndex(next);
        setMessage(GUIDE_MESSAGES[next]);
        setShowBubble(true);
    };

    useEffect(() => {
        if (!containerRef.current) return;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(200, 300);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0x000000, 0);
        containerRef.current.appendChild(renderer.domElement);

        // Camera - closer for character guide
        const camera = new THREE.PerspectiveCamera(30.0, 200 / 300, 0.1, 20.0);
        camera.position.set(0, 1.2, 2.5);

        // Scene
        const scene = new THREE.Scene();

        // Lights
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(1.0, 1.0, 1.0).normalize();
        scene.add(light);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        // Pink rim light for kawaii effect
        const rimLight = new THREE.DirectionalLight(0xff8fa3, 0.3);
        rimLight.position.set(-1, 0, -1);
        scene.add(rimLight);

        // VRM Loader
        let currentVrm: any = null;
        let mixer: THREE.AnimationMixer | null = null;
        const loader = new GLTFLoader();
        loader.register((parser) => new VRMLoaderPlugin(parser));

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

                const tracks: THREE.KeyframeTrack[] = [];
                clip.tracks.forEach((track) => {
                    const parts = track.name.split('.');
                    const mixamoBoneName = parts[0];
                    const propertyName = parts[1];
                    const vrmBoneName = mixamoVRMBoneMap[mixamoBoneName];
                    
                    if (vrmBoneName) {
                        const boneNode = vrm.humanoid.getNormalizedBoneNode(vrmBoneName);
                        if (boneNode) {
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
            });
        };

        loader.load(
            '/kawai-chan.vrm',
            (gltf) => {
                const vrm = gltf.userData.vrm;
                vrm.scene.position.set(0, -0.5, 0);
                vrm.scene.rotation.y = 0;
                scene.add(vrm.scene);
                currentVrm = vrm;

                if (vrm.expressionManager) {
                    vrm.expressionManager.setValue('happy', 0.5);
                }

                loadFBXAnimation('/Idle.fbx', vrm);

                // Auto-blink
                if (vrm.expressionManager) {
                    setInterval(() => {
                        vrm.expressionManager.setValue('blink', 1.0);
                        setTimeout(() => vrm.expressionManager.setValue('blink', 0.0), 100);
                    }, 3500);
                }
            },
            undefined,
            (error) => console.error('VRM load error:', error)
        );

        // Mouse tracking
        const mouse = new THREE.Vector2();
        const onMouseMove = (event: MouseEvent) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', onMouseMove);

        // Animation loop
        const clock = new THREE.Clock();
        const animate = () => {
            requestAnimationFrame(animate);
            const deltaTime = clock.getDelta();

            if (mixer) mixer.update(deltaTime);

            if (currentVrm) {
                if (currentVrm.humanoid) {
                    const head = currentVrm.humanoid.getNormalizedBoneNode('head');
                    if (head) {
                        head.rotation.y += THREE.MathUtils.lerp(0, mouse.x * 0.3, 0.1);
                        head.rotation.x += THREE.MathUtils.lerp(0, -mouse.y * 0.15, 0.1);
                    }
                }
                currentVrm.update(deltaTime);
            }

            renderer.render(scene, camera);
        };
        animate();

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            renderer.dispose();
            if (containerRef.current) {
                containerRef.current.removeChild(renderer.domElement);
            }
        };
    }, []);

    // Auto-hide bubble after delay
    useEffect(() => {
        if (showBubble) {
            const timer = setTimeout(() => setShowBubble(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [showBubble, message]);

    return (
        <div className="guide-character" onClick={nextMessage}>
            {showBubble && (
                <div className="speech-bubble">
                    <span>{message}</span>
                    <div className="bubble-tail"></div>
                </div>
            )}
            <div ref={containerRef} className="character-canvas" />
            <div className="character-glow"></div>
        </div>
    );
};

export default GuideCharacter;
