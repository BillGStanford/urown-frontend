// src/components/FontSettingsPanel.jsx
import React, { useState, useEffect } from 'react';

const FontSettingsPanel = ({ onSettingsChange, initialSettings = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    fontSize: initialSettings.fontSize || 18,
    lineHeight: initialSettings.lineHeight || 1.8,
    fontFamily: initialSettings.fontFamily || 'Georgia',
    theme: initialSettings.theme || 'light',
    width: initialSettings.width || 'normal',
    ...initialSettings
  });

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('ebookReaderSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Failed to load reader settings');
      }
    }
  }, []);

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Save to localStorage
    localStorage.setItem('ebookReaderSettings', JSON.stringify(newSettings));
    
    // Notify parent
    if (onSettingsChange) {
      onSettingsChange(newSettings);
    }
  };

  const fonts = [
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Times New Roman', value: '"Times New Roman", serif' },
    { name: 'Palatino', value: 'Palatino, serif' },
    { name: 'Garamond', value: 'Garamond, serif' },
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Helvetica', value: 'Helvetica, sans-serif' },
    { name: 'Verdana', value: 'Verdana, sans-serif' }
  ];

  const themes = [
    { name: 'Light', value: 'light', bg: '#ffffff', text: '#000000' },
    { name: 'Sepia', value: 'sepia', bg: '#f4ecd8', text: '#5c4a34' },
    { name: 'Dark', value: 'dark', bg: '#1a1a1a', text: '#e0e0e0' }
  ];

  const widths = [
    { name: 'Narrow', value: 'narrow', max: '600px' },
    { name: 'Normal', value: 'normal', max: '800px' },
    { name: 'Wide', value: 'wide', max: '1000px' }
  ];

  return (
    <div className="relative">
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 text-sm"
        title="Reader Settings"
      >
        <span>⚙️</span>
        <span className="hidden sm:inline">Settings</span>
      </button>

      {/* Settings Panel */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 z-50 bg-white border border-gray-300 rounded-lg shadow-xl p-6 w-80">
            <h3 className="font-bold text-lg mb-4">Reading Settings</h3>

            {/* Font Size */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">
                Font Size: {settings.fontSize}px
              </label>
              <input
                type="range"
                min="14"
                max="28"
                step="2"
                value={settings.fontSize}
                onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>A</span>
                <span className="text-lg">A</span>
              </div>
            </div>

            {/* Line Height */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">
                Line Height: {settings.lineHeight}
              </label>
              <input
                type="range"
                min="1.4"
                max="2.4"
                step="0.2"
                value={settings.lineHeight}
                onChange={(e) => updateSetting('lineHeight', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Compact</span>
                <span>Spacious</span>
              </div>
            </div>

            {/* Font Family */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">
                Font
              </label>
              <div className="grid grid-cols-2 gap-2">
                {fonts.map(font => (
                  <button
                    key={font.name}
                    onClick={() => updateSetting('fontFamily', font.value)}
                    className={`px-3 py-2 rounded text-sm border ${
                      settings.fontFamily === font.value
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                    style={{ fontFamily: font.value }}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">
                Theme
              </label>
              <div className="flex gap-2">
                {themes.map(theme => (
                  <button
                    key={theme.value}
                    onClick={() => updateSetting('theme', theme.value)}
                    className={`flex-1 px-3 py-2 rounded text-sm border ${
                      settings.theme === theme.value
                        ? 'border-blue-600 ring-2 ring-blue-200'
                        : 'border-gray-300'
                    }`}
                    style={{
                      backgroundColor: theme.bg,
                      color: theme.text
                    }}
                  >
                    {theme.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Width */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">
                Content Width
              </label>
              <div className="flex gap-2">
                {widths.map(width => (
                  <button
                    key={width.value}
                    onClick={() => updateSetting('width', width.value)}
                    className={`flex-1 px-3 py-2 rounded text-sm border ${
                      settings.width === width.value
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {width.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => {
                const defaultSettings = {
                  fontSize: 18,
                  lineHeight: 1.8,
                  fontFamily: 'Georgia, serif',
                  theme: 'light',
                  width: 'normal'
                };
                setSettings(defaultSettings);
                localStorage.setItem('ebookReaderSettings', JSON.stringify(defaultSettings));
                if (onSettingsChange) {
                  onSettingsChange(defaultSettings);
                }
              }}
              className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
            >
              Reset to Defaults
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default FontSettingsPanel;