# PLAN: Hệ thống đa ngôn ngữ (i18n) - Hybrid Approach

## Architecture
- Static Dictionary (vi, en, ja, ko) cho UI text
- Google Translate fallback cho dynamic content với cache
- Zustand store quản lý ngôn ngữ
- useTranslation() hook
