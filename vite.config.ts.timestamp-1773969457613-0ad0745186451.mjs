// vite.config.ts
import { defineConfig } from "file:///D:/Repositories/Pharmacy_Desktop_App/node_modules/vite/dist/node/index.js";
import react from "file:///D:/Repositories/Pharmacy_Desktop_App/node_modules/@vitejs/plugin-react/dist/index.js";
import tailwindcss from "file:///D:/Repositories/Pharmacy_Desktop_App/node_modules/@tailwindcss/vite/dist/index.mjs";
import electron from "file:///D:/Repositories/Pharmacy_Desktop_App/node_modules/vite-plugin-electron/dist/index.mjs";
import renderer from "file:///D:/Repositories/Pharmacy_Desktop_App/node_modules/vite-plugin-electron-renderer/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    electron([
      {
        entry: "backend/main.ts"
      },
      {
        entry: "backend/preload.ts",
        onstart(options) {
          options.reload();
        }
      }
    ]),
    renderer()
  ],
  server: {
    port: 5173,
    strictPort: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxSZXBvc2l0b3JpZXNcXFxcUGhhcm1hY3lfRGVza3RvcF9BcHBcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXFJlcG9zaXRvcmllc1xcXFxQaGFybWFjeV9EZXNrdG9wX0FwcFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovUmVwb3NpdG9yaWVzL1BoYXJtYWN5X0Rlc2t0b3BfQXBwL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tIFwiQHRhaWx3aW5kY3NzL3ZpdGVcIjtcbmltcG9ydCBlbGVjdHJvbiBmcm9tIFwidml0ZS1wbHVnaW4tZWxlY3Ryb25cIjtcbmltcG9ydCByZW5kZXJlciBmcm9tIFwidml0ZS1wbHVnaW4tZWxlY3Ryb24tcmVuZGVyZXJcIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgdGFpbHdpbmRjc3MoKSxcbiAgICBlbGVjdHJvbihbXG4gICAgICB7XG4gICAgICAgIGVudHJ5OiBcImJhY2tlbmQvbWFpbi50c1wiLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgZW50cnk6IFwiYmFja2VuZC9wcmVsb2FkLnRzXCIsXG4gICAgICAgIG9uc3RhcnQob3B0aW9ucykge1xuICAgICAgICAgIG9wdGlvbnMucmVsb2FkKCk7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIF0pLFxuICAgIHJlbmRlcmVyKCksXG4gIF0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDUxNzMsXG4gICAgc3RyaWN0UG9ydDogdHJ1ZSxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFvUyxTQUFTLG9CQUFvQjtBQUNqVSxPQUFPLFdBQVc7QUFDbEIsT0FBTyxpQkFBaUI7QUFDeEIsT0FBTyxjQUFjO0FBQ3JCLE9BQU8sY0FBYztBQUVyQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUEsSUFDWixTQUFTO0FBQUEsTUFDUDtBQUFBLFFBQ0UsT0FBTztBQUFBLE1BQ1Q7QUFBQSxNQUNBO0FBQUEsUUFDRSxPQUFPO0FBQUEsUUFDUCxRQUFRLFNBQVM7QUFDZixrQkFBUSxPQUFPO0FBQUEsUUFDakI7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUEsSUFDRCxTQUFTO0FBQUEsRUFDWDtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sWUFBWTtBQUFBLEVBQ2Q7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
