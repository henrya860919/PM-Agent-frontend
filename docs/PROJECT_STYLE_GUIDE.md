# PM-Agent 前端專案規範

本文件為 PM-Agent 前端的架構與開發規範，所有新程式碼與重構請依此執行。

---

## 1. 技術棧

| 項目 | 選型 |
|------|------|
| 框架 | Vue 3 (Composition API + `<script setup>`) |
| 語言 | TypeScript |
| 建置 | Vite |
| 路由 | Vue Router 4 |
| 狀態 | Pinia |
| UI 基礎 | shadcn-vue（radix-vue + Tailwind + CVA） |
| 圖示 | lucide-vue-next |
| 樣式 | Tailwind CSS，工具函式 `cn()` 來自 `@/lib/utils` |

---

## 2. 目錄結構與職責

```
src/
├── assets/          # 靜態資源（圖片、全域 CSS）
├── components/      # 僅放「跨頁面重複使用」的元件
│   ├── ui/          # 僅放 shadcn-vue 基礎 UI 元件（Button、Input、Dialog…）
│   └── layout/      # 版面元件（AppLayout、Sidebar、Header）
├── views/           # 路由頁面與該頁專用子元件（一頁一資料夾或單檔）
├── router/          # 路由定義
├── stores/          # Pinia stores
├── services/        # API 與後端通訊（axios 封裝、endpoints）
├── lib/             # 純工具（utils、constants）
├── types/           # 共用 TypeScript 型別
├── constants/       # 常數
└── main.ts
```

### 規則摘要

- **`src/components/`**：**只放會在多個頁面或多處重複使用的元件**（目前為 `ui/`、`layout/`）。單一頁面專用的 Dialog、Panel、步驟元件等**不要**放在這裡，應放在對應的 `views/` 下。
- **`src/components/ui/`**：只放由 shadcn-vue CLI 新增或手動對齊 shadcn 的基礎 UI 元件；不在這裡放業務邏輯。
- **`src/views/`**：每個路由頁面與其專用子元件都放在這裡。
  - **主要頁面**：可單檔（如 `HomeView.vue`）或一資料夾一個主檔（如 `workspace/WorkspaceView.vue`）。主頁檔名結尾為 `View.vue`。
  - **該頁專用子元件**（如 Dialog、Panel、步驟區塊）：放在該頁的資料夾內；可再分子資料夾（如 `workspace/steps/`）。**檔名結尾須與元件名稱一致**（例如 `WorkspaceDialog.vue`、`ChatPanel.vue`、`IntakeAnalysis.vue`）。
- 頁面從 `@/components/ui/xxx` 按需引用基礎 UI；同一頁的子元件用相對路徑（如 `./ChatPanel.vue`、`./steps/IntakeAnalysis.vue`）或 `@/views/xxx/` 引用。

---

## 3. UI 元件（shadcn-vue）管理

### 3.0 新增 UI 時優先使用 shadcn-vue

有需要新 UI 元件時，**請先到 [shadcn-vue 元件列表](https://www.shadcn-vue.com/docs/components) 查看是否有合適的元件**。若有，一律用 CLI 安裝（見 3.1），不要自己從頭實作。只有在官方沒有符合需求的元件時，才在 `src/components/ui/` 下手寫或封裝第三方套件。

### 3.1 新增 UI 元件

- 以 **CLI** 為主：`npx shadcn-vue@latest add <元件名>`  
  會依 `components.json` 寫入 `src/components/ui/`，勿隨意改 `components.json` 的 `aliases`。
- 每個元件一個資料夾，並提供 `index.ts` 統一 export，例如：
  - `src/components/ui/button/Button.vue`
  - `src/components/ui/button/index.ts` → `export { default as Button } from './Button.vue'`

### 3.2 引用方式：按需引用，禁止全域註冊

- **必須**：在需要使用的 `.vue` 或 `.ts` 中明確 import，例如：
  ```ts
  import { Button } from '@/components/ui/button';
  import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
  ```
- **禁止**：在 `main.ts` 或 plugin 中全域註冊 UI 元件（例如 `app.component('Button', ...)`），以避免 bundle 變大且依賴不透明。
- 路徑使用 **小寫**：`@/components/ui/button`、`@/components/ui/dialog`、`@/components/ui/input` 等，與 shadcn 慣例一致。

### 3.3 樣式與工具

- 樣式：Tailwind 類名 + 必要時使用 `cn()` 合併類別（`@/lib/utils`）。
- 主題相關使用 CSS 變數（如 `hsl(var(--primary))`），與 `components.json` 中 `tailwind.cssVariables` 一致。
- 圖示：從 `lucide-vue-next` 按需 import，不在全域註冊。

---

## 4. 命名規範

| 類型 | 規範 | 範例 |
|------|------|------|
| 頁面元件 | PascalCase，結尾 `View.vue` | `WorkspaceView.vue`、`DetailedSpecsView.vue` |
| 一般元件 | PascalCase | `ChatPanel.vue`、`AppSidebar.vue` |
| UI 元件資料夾 | 小寫（與 import 路徑一致） | `button`、`dialog`、`input` |
| Store | **依對應 View 命名**：檔名 kebab，`useXxxStore` | `workspace.ts`、`useWorkspaceStore`（對應 WorkspaceView） |
| Endpoint | **依對應 View 命名**：檔名 kebab，export `xxxApi` | `file-records.ts`、`fileRecordsApi`（對應 FileRecordsView） |
| 路由 name | kebab-case，與 view 對齊 | `workspace`、`file-records`、`feature-list` |
| 路由 path | kebab-case，可與 name 一致 | `/workspace`、`/file-records` |

---

## 5. 路由與視圖

- 路由定義在 `src/router/index.ts`。
- 頁面元件使用 **懶加載**：`component: () => import('@/views/xxx/XxxView.vue')`。
- 版面由 `AppLayout` 包一層，需版面的路由放在 `AppLayout` 的 `children` 下；獨立頁（如 `/home`）可不包 layout。

---

## 6. 狀態管理（Pinia）

- 每個 store 一個檔案，放在 `src/stores/`。
- 命名：`useXxxStore`，檔案名可為 `xxx.ts` 或 `xxx-store.ts`。
- 不在 store 內直接依賴 UI 元件或 router 實例；必要時在元件中 `useRouter()` / `useRoute()`。

---

## 7. API 與服務

- 請求客戶端封裝在 `src/services/`（例如 `client.ts`）。
- Endpoint 檔名與 export 依對應 View 命名（如 `file-records.ts`、`fileRecordsApi` 對應 FileRecordsView）。
- 型別定義放在 `src/types/`，與 API 回應對齊。

---

## 7.1 常數（src/constants/）

- 路由／視圖：route id、path、label → `constants/routes.ts`，供 router、Sidebar、Header 共用。
- 業務選項與對應表：狀態對應、顏色、標籤、篩選選項 → 依領域分檔（`project.ts`、`file.ts`、`logic-flag.ts`、`workspace.ts`）。
- 魔術字串與數字（輪詢間隔、API 參數等）抽成常數，從 `@/constants/xxx` 引用。

## 7.2 Utils 與 Composables

- **utils/**：純函式（輸入→輸出，無 ref、無 Vue API）。例：日期／時間格式化 → `utils/format.ts`。
- **composables/**：有狀態或使用 Vue 生命週期的邏輯。

---

## 8. 程式碼風格

- **Vue**：使用 `<script setup lang="ts">`，優先 Composition API。
- **ESLint**：依專案現有 `eslint.config.js`，提交前請通過 `npm run lint`。
- **Prettier**：與 ESLint 整合，維持既有格式。
- 除錯用 `console` 僅限開發，正式環境請用適當日誌或移除，並注意 ESLint `no-console` 規則。

---

## 9. 快速檢查清單（提交前）

- [ ] `components/` 僅放跨頁重複使用的元件（ui、layout）；單頁專用元件放在 `views/` 對應頁面資料夾。
- [ ] 新 UI 元件只放在 `src/components/ui/`，且經由 `@/components/ui/<元件名>` 按需引用。
- [ ] 未在 `main.ts` 或 plugin 中全域註冊 shadcn-vue 元件。
- [ ] 新頁面放在 `views/`，主頁檔名為 `XxxView.vue`；該頁子元件檔名結尾與元件名一致（如 `XxxDialog.vue`）。
- [ ] 路徑使用 `@/` 別名（`@/components`、`@/views`、`@/lib/utils` 等）。
- [ ] `npm run lint` 通過。

---

*最後更新：依專案現狀訂定，後續若技術棧或目錄調整請同步更新本文件。*
