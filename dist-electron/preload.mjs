import { contextBridge, ipcRenderer } from "electron";
const api = {
  system: {
    getStatus: () => ipcRenderer.invoke("system:getStatus")
  },
  inventory: {
    list: (query) => ipcRenderer.invoke("inventory:list", query),
    getSummary: () => ipcRenderer.invoke("inventory:getSummary")
  },
  pos: {
    listCatalog: (query) => ipcRenderer.invoke("pos:listCatalog", query)
  },
  orders: {
    list: (query) => ipcRenderer.invoke("orders:list", query)
  },
  admin: {
    listUsers: (query) => ipcRenderer.invoke("admin:listUsers", query),
    listManufacturers: () => ipcRenderer.invoke("admin:listManufacturers")
  },
  settings: {
    getReceiptSettings: () => ipcRenderer.invoke("settings:getReceiptSettings")
  }
};
contextBridge.exposeInMainWorld("api", api);
