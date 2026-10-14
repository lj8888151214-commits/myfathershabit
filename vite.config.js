import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    // 💡 원하시는 정확한 static 폴더의 절대 경로 지정
    outDir: resolve(__dirname, 'C:/SpringWork/RC/RC/src/main/resources/static'),
    emptyOutDir: true,
  }
})