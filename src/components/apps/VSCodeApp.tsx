import React, { useState } from 'react';
import './VSCodeApp.css';

const VSCodeApp: React.FC = () => {
    const [activeFile, setActiveFile] = useState('App.tsx');

    const files = [
        { name: 'src', type: 'folder', children: [
            { name: 'App.tsx', type: 'file' },
            { name: 'main.tsx', type: 'file' },
            { name: 'index.css', type: 'file' },
        ]},
        { name: 'components', type: 'folder', children: [
            { name: 'Desktop.tsx', type: 'file' },
            { name: 'Window.tsx', type: 'file' },
        ]},
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

    const renderFileTree = (items: any[], depth = 0) => {
        return items.map((item, index) => (
            <div key={index}>
                <div 
                    className={`file-item ${item.type} ${activeFile === item.name ? 'active' : ''}`}
                    style={{ paddingLeft: `${12 + depth * 16}px` }}
                    onClick={() => item.type === 'file' && setActiveFile(item.name)}
                >
                    <span className="file-icon">
                        {item.type === 'folder' ? '📁' : getFileIcon(item.name)}
                    </span>
                    <span className="file-name">{item.name}</span>
                </div>
                {item.children && renderFileTree(item.children, depth + 1)}
            </div>
        ));
    };

    const getFileIcon = (name: string) => {
        if (name.endsWith('.tsx') || name.endsWith('.ts')) return '⚛️';
        if (name.endsWith('.css')) return '🎨';
        if (name.endsWith('.json')) return '📋';
        if (name.endsWith('.md')) return '📝';
        return '📄';
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
        // Simple syntax highlighting
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
                <div className="activity-icon active">📁</div>
                <div className="activity-icon">🔍</div>
                <div className="activity-icon">🔀</div>
                <div className="activity-icon">🐛</div>
                <div className="activity-icon">🧩</div>
                <div className="activity-spacer"></div>
                <div className="activity-icon">⚙️</div>
            </div>

            {/* Sidebar */}
            <div className="sidebar">
                <div className="sidebar-header">
                    <span>EXPLORER</span>
                </div>
                <div className="file-tree">
                    <div className="project-header">
                        <span>📂 KAWAI-PROJECT</span>
                    </div>
                    {renderFileTree(files)}
                </div>
            </div>

            {/* Editor */}
            <div className="editor-area">
                {/* Tabs */}
                <div className="editor-tabs">
                    {Object.keys(codeContents).filter(f => f === activeFile).map(file => (
                        <div key={file} className="editor-tab active">
                            <span>{getFileIcon(file)}</span>
                            <span>{file}</span>
                            <button className="tab-close">✕</button>
                        </div>
                    ))}
                </div>

                {/* Code Area */}
                <div className="code-area">
                    {codeContents[activeFile] && renderCode(codeContents[activeFile])}
                </div>
            </div>

            {/* Status Bar */}
            <div className="status-bar">
                <div className="status-left">
                    <span>🔀 main</span>
                    <span>✓ No issues</span>
                </div>
                <div className="status-right">
                    <span>TypeScript React</span>
                    <span>UTF-8</span>
                    <span>Ln 1, Col 1</span>
                </div>
            </div>
        </div>
    );
};

export default VSCodeApp;
