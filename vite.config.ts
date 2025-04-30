import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  server: {
    allowedHosts: ["miniapp.haolinguanjia.com"],
    host: '0.0.0.0',//使用当前的IP地址，没有这个就是以localhost作为本地地址
    open: false, //是否在默认浏览器中自动打开该地址
    proxy: { //使用代理
      '/api': { //当有 /api开头的地址是，代理到target地址
        target: 'http://211.159.223.17:8524', // 需要跨域代理的本地路径
        // target: 'http://127.0.0.1:8524', // 需要跨域代理的本地路径/
        changeOrigin: true, //是否改变请求源头
        rewrite: (path) => path.replace(/^\/api/, '') // 路径重写
      }
    }
  }
});
