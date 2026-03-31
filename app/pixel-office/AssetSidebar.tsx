'use client';

import { useState, useRef } from 'react';
import { useI18n } from '@/lib/i18n';

type Tab = 'upload' | 'ai' | 'reset';

export function AssetSidebar() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [tab, setTab] = useState<Tab>('upload');

  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [geminiKey, setGeminiKey] = useState('');
  const [geminiKeySaved, setGeminiKeySaved] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [genMessage, setGenMessage] = useState('');

  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  function tryUnlock() {
    fetch('/api/assets/upload', {
      method: 'POST',
      headers: { 'x-asset-pass': password },
      body: new FormData(),
    }).then((r) => {
      if (r.status === 401) {
        setPasswordError(t('assetDrawer.passwordWrong'));
      } else {
        setUnlocked(true);
        setPasswordError('');
      }
    }).catch(() => setPasswordError(t('assetDrawer.passwordWrong')));
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadMessage('');
    const form = new FormData();
    for (const file of Array.from(files)) form.append('file', file);
    try {
      const r = await fetch('/api/assets/upload', {
        method: 'POST',
        headers: { 'x-asset-pass': password },
        body: form,
      });
      const data = await r.json();
      setUploadMessage(data.error ? `${t('assetDrawer.uploadFail')}: ${data.error}` : t('assetDrawer.uploadSuccess'));
    } catch (e: any) {
      setUploadMessage(`${t('assetDrawer.uploadFail')}: ${e.message}`);
    } finally {
      setUploading(false);
    }
  }

  async function saveGeminiKey() {
    await fetch('/api/config/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-asset-pass': password },
      body: JSON.stringify({ apiKey: geminiKey }),
    });
    setGeminiKeySaved(true);
    setTimeout(() => setGeminiKeySaved(false), 2000);
  }

  async function generateBg() {
    if (!prompt.trim()) return;
    setGenerating(true);
    setGenMessage('');
    try {
      const r = await fetch('/api/assets/generate-bg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-asset-pass': password },
        body: JSON.stringify({ prompt }),
      });
      const { taskId, error } = await r.json();
      if (error) {
        setGenMessage(`${t('assetDrawer.generateFail')}: ${error}`);
        setGenerating(false);
        return;
      }

      const poll = async () => {
        const pr = await fetch(`/api/assets/generate-bg/poll/${taskId}`);
        const data = await pr.json();
        if (data.status === 'done') {
          setGenMessage(t('assetDrawer.generateDone'));
          setGenerating(false);
        } else if (data.status === 'error') {
          setGenMessage(`${t('assetDrawer.generateFail')}: ${data.error}`);
          setGenerating(false);
        } else {
          setTimeout(poll, 2000);
        }
      };
      setTimeout(poll, 2000);
    } catch (e: any) {
      setGenMessage(`${t('assetDrawer.generateFail')}: ${e.message}`);
      setGenerating(false);
    }
  }

  async function resetAssets() {
    if (!window.confirm(t('assetDrawer.resetConfirm'))) return;
    setResetting(true);
    setResetMessage('');
    try {
      const r = await fetch('/api/assets/reset', {
        method: 'DELETE',
        headers: { 'x-asset-pass': password },
      });
      const data = await r.json();
      setResetMessage(data.error ? data.error : t('assetDrawer.resetSuccess'));
    } catch (e: any) {
      setResetMessage(e.message);
    } finally {
      setResetting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 1000,
          padding: '8px 16px', borderRadius: 8,
          background: 'var(--accent)', color: 'var(--bg)',
          border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14,
        }}
      >
        🎨 {t('nav.decorate')}
      </button>

      {open && (
        <div
          style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: 320, zIndex: 999,
            background: 'var(--card)', borderLeft: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', padding: 16, gap: 12,
            overflowY: 'auto',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>🎨 {t('assetDrawer.title')}</h2>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}
            >
              ×
            </button>
          </div>

          {!unlocked ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && tryUnlock()}
                placeholder={t('assetDrawer.passwordPlaceholder')}
                style={{
                  padding: '8px 12px', borderRadius: 6,
                  border: '1px solid var(--border)', background: 'var(--bg)',
                  color: 'var(--text)', fontSize: 14,
                }}
              />
              {passwordError && <p style={{ color: '#ef4444', fontSize: 12, margin: 0 }}>{passwordError}</p>}
              <button
                onClick={tryUnlock}
                style={{
                  padding: '8px 16px', borderRadius: 6,
                  background: 'var(--accent)', color: 'var(--bg)',
                  border: 'none', cursor: 'pointer', fontWeight: 600,
                }}
              >
                {t('assetDrawer.passwordUnlock')}
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
                {(['upload', 'ai', 'reset'] as Tab[]).map((tabKey) => {
                  const labels: Record<Tab, string> = {
                    upload: t('assetDrawer.tabUpload'),
                    ai: t('assetDrawer.tabAI'),
                    reset: t('assetDrawer.tabReset'),
                  };
                  return (
                    <button
                      key={tabKey}
                      onClick={() => setTab(tabKey)}
                      style={{
                        flex: 1, padding: '8px 4px', border: 'none', cursor: 'pointer',
                        background: 'none', fontSize: 12, fontWeight: tab === tabKey ? 700 : 400,
                        color: tab === tabKey ? 'var(--accent)' : 'var(--text-muted)',
                        borderBottom: tab === tabKey ? '2px solid var(--accent)' : '2px solid transparent',
                      }}
                    >
                      {labels[tabKey]}
                    </button>
                  );
                })}
              </div>

              {tab === 'upload' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{t('assetDrawer.uploadHint')}</p>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); handleUpload(e.dataTransfer.files); }}
                    style={{
                      border: '2px dashed var(--border)', borderRadius: 8, padding: '24px 16px',
                      textAlign: 'center', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13,
                    }}
                  >
                    {uploading ? '⏳ ...' : `📁 ${t('assetDrawer.uploadBtn')}`}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".webp,.png,.jpg,.jpeg"
                    style={{ display: 'none' }}
                    onChange={(e) => handleUpload(e.target.files)}
                  />
                  {uploadMessage && (
                    <p style={{ fontSize: 12, color: uploadMessage.includes(t('assetDrawer.uploadFail')) ? '#ef4444' : '#10b981', margin: 0 }}>
                      {uploadMessage}
                    </p>
                  )}
                </div>
              )}

              {tab === 'ai' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('assetDrawer.geminiKeyLabel')}</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      type="password"
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      placeholder="AIza..."
                      style={{
                        flex: 1, padding: '6px 10px', borderRadius: 6,
                        border: '1px solid var(--border)', background: 'var(--bg)',
                        color: 'var(--text)', fontSize: 13,
                      }}
                    />
                    <button
                      onClick={saveGeminiKey}
                      style={{
                        padding: '6px 12px', borderRadius: 6,
                        background: 'var(--accent)', color: 'var(--bg)',
                        border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                      }}
                    >
                      {geminiKeySaved ? t('assetDrawer.geminiKeySaved') : t('assetDrawer.geminiKeySave')}
                    </button>
                  </div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('assetDrawer.promptLabel')}</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={t('assetDrawer.promptPlaceholder')}
                    rows={4}
                    style={{
                      padding: '8px 10px', borderRadius: 6,
                      border: '1px solid var(--border)', background: 'var(--bg)',
                      color: 'var(--text)', fontSize: 13, resize: 'vertical',
                    }}
                  />
                  <button
                    onClick={generateBg}
                    disabled={generating || !prompt.trim()}
                    style={{
                      padding: '8px 16px', borderRadius: 6,
                      background: 'var(--accent)', color: 'var(--bg)',
                      border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
                      opacity: generating || !prompt.trim() ? 0.5 : 1,
                    }}
                  >
                    {generating ? t('assetDrawer.generating') : t('assetDrawer.generateBtn')}
                  </button>
                  {genMessage && (
                    <p style={{ fontSize: 12, color: genMessage.includes(t('assetDrawer.generateFail')) ? '#ef4444' : '#10b981', margin: 0 }}>
                      {genMessage}
                    </p>
                  )}
                </div>
              )}

              {tab === 'reset' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                    {t('assetDrawer.resetConfirm')}
                  </p>
                  <button
                    onClick={resetAssets}
                    disabled={resetting}
                    style={{
                      padding: '10px 16px', borderRadius: 6,
                      background: '#ef4444', color: 'white',
                      border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
                      opacity: resetting ? 0.5 : 1,
                    }}
                  >
                    {resetting ? '...' : t('assetDrawer.resetBtn')}
                  </button>
                  {resetMessage && (
                    <p style={{ fontSize: 12, color: '#10b981', margin: 0 }}>{resetMessage}</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
