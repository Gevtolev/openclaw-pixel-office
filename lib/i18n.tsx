'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export type Locale = 'zh' | 'zh-TW' | 'en' | 'ja';

const translations: Record<Locale, Record<string, string>> = {
  zh: {
    'nav.office': '像素办公室',
    'nav.dashboard': 'Agent 总览',
    'nav.models': '模型列表',
    'nav.sessions': '会话列表',
    'nav.stats': '消息统计',
    'nav.alerts': '告警中心',
    'nav.skills': '技能管理',
    'nav.overview': '总览',
    'nav.monitor': '监控',
    'nav.config': '配置',
    'status.idle': '待命',
    'status.writing': '工作中',
    'status.researching': '调研中',
    'status.executing': '执行中',
    'status.syncing': '同步中',
    'status.error': '异常',
    'status.offline': '离线',
    'office.title': '的像素办公室',
    'office.yesterday': '昨日小记',
    'office.noMemo': '暂无昨日日记',
    'office.visitors': '访客列表',
    'office.noVisitors': '暂无访客',
    'office.loading': '正在进入像素办公室…',
    'office.decorate': '装修房间',
    'office.noSeat': '没位子了',
    'office.tempWorker': '临时工',
    'control.title': 'Star 状态',
    'control.idle': '待命',
    'control.work': '工作',
    'control.sync': '同步',
    'control.alert': '警报',
  },
  'zh-TW': {
    'nav.office': '像素辦公室',
    'nav.dashboard': 'Agent 總覽',
    'nav.models': '模型列表',
    'nav.sessions': '會話列表',
    'nav.stats': '訊息統計',
    'nav.alerts': '告警中心',
    'nav.skills': '技能管理',
    'nav.overview': '總覽',
    'nav.monitor': '監控',
    'nav.config': '配置',
    'status.idle': '待命',
    'status.writing': '工作中',
    'status.researching': '調研中',
    'status.executing': '執行中',
    'status.syncing': '同步中',
    'status.error': '異常',
    'status.offline': '離線',
    'office.title': '的像素辦公室',
    'office.yesterday': '昨日小記',
    'office.noMemo': '暫無昨日日記',
    'office.visitors': '訪客列表',
    'office.noVisitors': '暫無訪客',
    'office.loading': '正在進入像素辦公室…',
    'office.decorate': '裝修房間',
    'office.noSeat': '沒位子了',
    'office.tempWorker': '臨時工',
    'control.title': 'Star 狀態',
    'control.idle': '待命',
    'control.work': '工作',
    'control.sync': '同步',
    'control.alert': '警報',
  },
  en: {
    'nav.office': 'Pixel Office',
    'nav.dashboard': 'Agent Overview',
    'nav.models': 'Models',
    'nav.sessions': 'Sessions',
    'nav.stats': 'Statistics',
    'nav.alerts': 'Alerts',
    'nav.skills': 'Skills',
    'nav.overview': 'Overview',
    'nav.monitor': 'Monitor',
    'nav.config': 'Config',
    'status.idle': 'Idle',
    'status.writing': 'Writing',
    'status.researching': 'Researching',
    'status.executing': 'Executing',
    'status.syncing': 'Syncing',
    'status.error': 'Error',
    'status.offline': 'Offline',
    'office.title': "'s Pixel Office",
    'office.yesterday': 'Yesterday Notes',
    'office.noMemo': 'No notes from yesterday',
    'office.visitors': 'Visitor List',
    'office.noVisitors': 'No visitors',
    'office.loading': 'Entering pixel office…',
    'office.decorate': 'Decorate Room',
    'office.noSeat': 'No seats left',
    'office.tempWorker': 'Temp Worker',
    'control.title': 'Star Status',
    'control.idle': 'Idle',
    'control.work': 'Work',
    'control.sync': 'Sync',
    'control.alert': 'Alert',
  },
  ja: {
    'nav.office': 'ピクセルオフィス',
    'nav.dashboard': 'Agentの概要',
    'nav.models': 'モデル一覧',
    'nav.sessions': 'セッション',
    'nav.stats': 'メッセージ統計',
    'nav.alerts': 'アラート',
    'nav.skills': 'スキル管理',
    'nav.overview': '概要',
    'nav.monitor': '監視',
    'nav.config': '設定',
    'status.idle': '待機中',
    'status.writing': '作業中',
    'status.researching': 'リサーチ中',
    'status.executing': '実行中',
    'status.syncing': '同期中',
    'status.error': 'エラー',
    'status.offline': 'オフライン',
    'office.title': 'のピクセルオフィス',
    'office.yesterday': '昨日のメモ',
    'office.noMemo': '昨日のメモはありません',
    'office.visitors': '来客リスト',
    'office.noVisitors': '来客なし',
    'office.loading': 'ピクセルオフィスに入室中…',
    'office.decorate': '部屋を飾る',
    'office.noSeat': '席がない',
    'office.tempWorker': '派遣さん',
    'control.title': 'Star ステータス',
    'control.idle': '待機',
    'control.work': '作業',
    'control.sync': '同期',
    'control.alert': '警報',
  },
};

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'zh',
  setLocale: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('zh');

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale | null;
    if (saved && translations[saved]) setLocaleState(saved);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('locale', l);
  }, []);

  const t = useCallback(
    (key: string) => translations[locale]?.[key] ?? translations['zh']?.[key] ?? key,
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
