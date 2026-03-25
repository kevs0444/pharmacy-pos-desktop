const { contextBridge, ipcRenderer } = require('electron');

const api = {
  system: { getStatus: () => ipcRenderer.invoke("system:getStatus") },
  inventory: { 
    list: (q) => ipcRenderer.invoke("inventory:list", q), 
    getSummary: () => ipcRenderer.invoke("inventory:getSummary"),
    create: (payload) => ipcRenderer.invoke("inventory:create", payload),
    update: (id, payload) => ipcRenderer.invoke("inventory:update", { id, payload }),
    remove: (id) => ipcRenderer.invoke("inventory:remove", id),
    setActive: (id, isActive) => ipcRenderer.invoke("inventory:setActive", { id, isActive }),
    listBatches: (productId) => ipcRenderer.invoke("inventory:listBatches", productId)
  },
  pos: { listCatalog: (q) => ipcRenderer.invoke("pos:listCatalog", q) },
  orders: { list: (q) => ipcRenderer.invoke("orders:list", q) },
  admin: { 
    listUsers: (q) => ipcRenderer.invoke("admin:listUsers", q), 
    listManufacturers: () => ipcRenderer.invoke("admin:listManufacturers"),
    createManufacturer: (payload) => ipcRenderer.invoke("admin:createManufacturer", payload)
  },
  settings: { getReceiptSettings: () => ipcRenderer.invoke("settings:getReceiptSettings") }
};

contextBridge.exposeInMainWorld("api", api);