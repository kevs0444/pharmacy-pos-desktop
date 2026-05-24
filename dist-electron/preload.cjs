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
    listBatches: (productId) => ipcRenderer.invoke("inventory:listBatches", productId),
    submitChangeRequest: (input) => ipcRenderer.invoke("inventory:submitChangeRequest", input),
    listChangeRequests: (status) => ipcRenderer.invoke("inventory:listChangeRequests", status),
    reviewChangeRequest: (id, input) => ipcRenderer.invoke("inventory:reviewChangeRequest", { id, input }),
  },
  pos: { 
    listCatalog: (q) => ipcRenderer.invoke("pos:listCatalog", q),
    checkout: (payload) => ipcRenderer.invoke("pos:checkout", payload),
    searchCustomers: (query) => ipcRenderer.invoke("pos:searchCustomers", query),
    saveCustomer: (input) => ipcRenderer.invoke("pos:saveCustomer", input)
  },
  orders: { 
    list: (q) => ipcRenderer.invoke("orders:list", q),
    getItems: (orderId) => ipcRenderer.invoke("orders:getItems", orderId),
    updateStatus: (orderId, status) => ipcRenderer.invoke("orders:updateStatus", { orderId, status }),
    save: (input) => ipcRenderer.invoke("orders:save", input),
    delete: (orderId) => ipcRenderer.invoke("orders:delete", orderId)
  },
  admin: { 
    listUsers: (q) => ipcRenderer.invoke("admin:listUsers", q), 
    listManufacturers: () => ipcRenderer.invoke("admin:listManufacturers"),
    createManufacturer: (payload) => ipcRenderer.invoke("admin:createManufacturer", payload)
  },
  settings: { getReceiptSettings: () => ipcRenderer.invoke("settings:getReceiptSettings") }
};

contextBridge.exposeInMainWorld("api", api);