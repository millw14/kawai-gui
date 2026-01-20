import React, { useState } from 'react';
import {
    VscFiles, VscSearch, VscSourceControl, VscDebugAlt, VscExtensions,
    VscSettingsGear, VscAccount, VscChromeClose, VscChevronRight, VscChevronDown,
    VscFolder, VscFile, VscJson, VscMarkdown, VscSymbolMethod, VscPaintcan,
    VscTerminal, VscError, VscWarning, VscCheck, VscEllipsis
} from 'react-icons/vsc';
import Terminal from './Terminal';
import './VSCodeApp.css';

const VSCodeApp: React.FC = () => {
    const [activeFile, setActiveFile] = useState('App.tsx');
    const [isTerminalOpen, setIsTerminalOpen] = useState(true);
    const [expandedFolders, setExpandedFolders] = useState<string[]>(['src', 'components']);

    const files = [
        {
            name: 'src', type: 'folder', children: [
                { name: 'App.tsx', type: 'file' },
                { name: 'main.tsx', type: 'file' },
                { name: 'index.css', type: 'file' },
            ]
        },
        {
            name: 'components', type: 'folder', children: [
                { name: 'Desktop.tsx', type: 'file' },
                { name: 'Window.tsx', type: 'file' },
            ]
        },
        { name: 'package.json', type: 'file' },
        { name: 'README.md', type: 'file' },
    ];

    const codeContents: { [key: string]: string } = {
        'App.tsx': `import React from 'react';
import Desktop from './components/Desktop';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  return <Desktop />;
}

export default App;`,
        'main.tsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
        'index.css': `:root {
  --kawai-pink: #ffb6c1;
  --kawai-purple: #e6e6fa;
}

body {
  margin: 0;
  background: linear-gradient(135deg, #1a1a2e, #2d1b4e);
  font-family: 'Outfit', sans-serif;
}`,
        'Desktop.tsx': `import React, { useState } from 'react';
import Window from './Window';
import Taskbar from './Taskbar';

const Desktop: React.FC = () => {
  const [windows, setWindows] = useState([]);
  
  return (
    <div className="desktop">
      {/* Desktop Icons */}
      {/* Windows */}
      {/* Taskbar */}
    </div>
  );
};

export default Desktop;`,
        'Window.tsx': `import React from 'react';

interface WindowProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

const Window: React.FC<WindowProps> = ({ title, children, onClose }) => {
  return (
    <div className="window">
      <div className="titlebar">
        <span>{title}</span>
        <button onClick={onClose}>✕</button>
      </div>
      <div className="content">{children}</div>
    </div>
  );
};`,
        'package.json': `{
  "name": "milla-pc-simulation",
  "version": "1.0.0",
  "dependencies": {
    "react": "^19.0.0",
    "three": "^0.182.0",
    "@pixiv/three-vrm": "^3.4.5"
  }
}`,
        'README.md': `# Milla's PC Simulation 🌸

A virtual desktop experience with:
- VS Code simulator
- Browser simulator  
- GitHub app
- Fun mini-games
- Cute 3D guide character

Built with React + Three.js + Tauri`
    };

    const toggleFolder = (folderName: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedFolders(prev =>
            prev.includes(folderName)
                ? prev.filter(f => f !== folderName)
                : [...prev, folderName]
        );
    };

    const renderFileTree = (items: any[], depth = 0) => {
        return items.map((item, index) => {
            const isExpanded = expandedFolders.includes(item.name);
            const indent = 20 + depth * 12;

            return (
                <div key={index}>
                    <div
                        className={`file-item ${item.type} ${activeFile === item.name ? 'active' : ''}`}
                        style={{ paddingLeft: `${indent}px` }}
                        onClick={(e) => {
                            if (item.type === 'folder') toggleFolder(item.name, e);
                            else setActiveFile(item.name);
                        }}
                    >
                        <span className="file-icon" style={{ marginRight: '6px' }}>
                            {item.type === 'folder'
                                ? (isExpanded ? <VscChevronDown /> : <VscChevronRight />)
                                : null}
                            {getFileIcon(item.name, item.type, isExpanded)}
                        </span>
                        <span className="file-name">{item.name}</span>
                    </div>
                    {item.children && isExpanded && renderFileTree(item.children, depth + 1)}
                </div>
            );
        });
    };

    const getFileIcon = (name: string, type: string, isExpanded: boolean) => {
        if (type === 'folder') return <VscFolder color={isExpanded ? "#dcb67a" : "#dcb67a"} />;
        if (name.endsWith('.tsx') || name.endsWith('.ts')) return <VscSymbolMethod color="#61dafb" />;
        if (name.endsWith('.css')) return <VscPaintcan color="#42a5f5" />;
        if (name.endsWith('.json')) return <VscJson color="#fbc02d" />;
        if (name.endsWith('.md')) return <VscMarkdown color="#ba68c8" />;
        return <VscFile color="#cccccc" />;
    };

    const renderCode = (code: string) => {
        return code.split('\n').map((line, i) => (
            <div key={i} className="code-line">
                <span className="line-number">{i + 1}</span>
                <span className="line-content">{highlightSyntax(line)}</span>
            </div>
        ));
    };

    const highlightSyntax = (line: string) => {
        // Simple syntax highlighting regex
        return line
            .replace(/(import|from|export|default|const|let|return|if|function|interface)/g, '<span class="keyword">$1</span>')
            .replace(/('.*?'|".*?")/g, '<span class="string">$1</span>')
            .replace(/(\{|\}|\(|\)|\[|\])/g, '<span class="bracket">$1</span>')
            .replace(/(\/\/.*)/g, '<span class="comment">$1</span>');
    };

    return (
        <div className="vscode-app">
            {/* Activity Bar */}
            <div className="activity-bar">
                <div className="activity-icon active"><VscFiles /></div>
                <div className="activity-icon"><VscSearch /></div>
                <div className="activity-icon"><VscSourceControl /></div>
                <div className="activity-icon"><VscDebugAlt /></div>
                <div className="activity-icon"><VscExtensions /></div>
                <div className="activity-spacer"></div>
                <div className="activity-icon"><VscAccount /></div>
                <div className="activity-icon"><VscSettingsGear /></div>
            </div>

            {/* Sidebar */}
            <div className="sidebar">
                <div className="sidebar-header">
                    <span>EXPLORER</span>
                    <span style={{ marginLeft: 'auto' }}><VscEllipsis /></span>
                </div>
                <div className="file-tree">
                    <div className="project-header" onClick={() => toggleFolder('root', {} as any)}>
                        <VscChevronDown />
                        <span>KAWAI-PROJECT</span>
                    </div>
                    {renderFileTree(files)}
                </div>
            </div>

            {/* Editor Area (Includes Terminal) */}
            <div className="editor-area">
                {/* Tabs */}
                <div className="editor-tabs">
                    {Object.keys(codeContents).filter(f => f === activeFile).map(file => (
                        <div key={file} className="editor-tab active">
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                                {getFileIcon(file, 'file', false)}
                            </span>
                            <span>{file}</span>
                            <button className="tab-close"><VscChromeClose /></button>
                        </div>
                    ))}
                </div>

                {/* Code Area */}
                <div className="code-area">
                    {codeContents[activeFile] && renderCode(codeContents[activeFile])}
                </div>

                {/* Terminal Panel */}
                {isTerminalOpen && (
                    <div className="terminal-panel">
                        <Terminal onClose={() => setIsTerminalOpen(false)} />
                    </div>
                )}
            </div>

            {/* Status Bar */}
            <div className="status-bar">
                <div className="status-left">
                    <div className="status-item"><VscSourceControl /> <span>main</span></div>
                    <div className="status-item"><VscError /> <span>0</span> <VscWarning /> <span>0</span></div>
                </div>
                <div className="status-right">
                    <div className="status-item" onClick={() => setIsTerminalOpen(!isTerminalOpen)}>
                        <VscTerminal />
                    </div>
                    <span>TypeScript React</span>
                    <span>UTF-8</span>
                    <div className="status-item"><VscCheck /> <span>Prettier</span></div>
                </div>
            </div>
        </div>
    );
};

export default VSCodeApp;
