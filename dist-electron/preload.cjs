const { contextBridge, ipcRenderer } = require('electron');

const api = {
  system: { getStatus: () => ipcRenderer.invoke("system:getStatus") },
  inventory: { 
    list: (q) => ipcRenderer.invoke("inventory:list", q), 
    getSummary: () => ipcRenderer.invoke("inventory:getSummary") 
  },
  pos: { listCatalog: (q) => ipcRenderer.invoke("pos:listCatalog", q) },
  orders: { list: (q) => ipcRenderer.invoke("orders:list", q) },
  admin: { 
    listUsers: (q) => ipcRenderer.invoke("admin:listUsers", q), 
    listManufacturers: () => ipcRenderer.invoke("admin:listManufacturers") 
  },
  settings: { getReceiptSettings: () => ipcRenderer.invoke("settings:getReceiptSettings") }
};

contextBridge.exposeInMainWorld("api", api);