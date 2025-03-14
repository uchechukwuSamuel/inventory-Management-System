let db;
async function initializeDB() {
  const SQL = await initSqlJs({
    locateFile: (file) =>
      `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/`,
  });
  db = new SQL.Database();
  db.run("PRAGMA foreign_keys = ON");
  createInventoryTable();
  createPurchaseTable();
  createSalesTable();
  return db;
}
initializeDB();
function createInventoryTable() {
  const inventoryTableQuery = `CREATE TABLE IF NOT EXISTS inventory_table(id INTEGER PRIMARY KEY AUTOINCREMENT, itemName TEXT NOT NULL, quantity INTEGER NOT NULL, price INTEGER NOT NULL)`;
  try {
    db.run(inventoryTableQuery);
    console.log("Successfully Created");
  } catch (err) {
    console.log("Error creating inventory table", err.message);
  }
}
function createPurchaseTable() {
  function createPurchaseDetailsTable() {
    const purchaseTableQuery = `CREATE TABLE IF NOT EXISTS purchase_details_table (purchaseID INTEGER PRIMARY KEY, vendor TEXT NOT NULL, totalPurchaseCost INTEGER NOT NULL, purchaseDate DATE NOT NULL)`;
    try {
      db.run(purchaseTableQuery);
      console.log("Table Successfully Created!");
    } catch (err) {
      console.log("Error creating purchase details table", err.message);
    }
  }
  function createPurchasedItemsTable() {
    const purchasedItemsTableQuery = `CREATE TABLE IF NOT EXISTS purchased_items_table (purchasedItemID INTEGER PRIMARY KEY, purchaseID INTEGER NOT NULL, itemName TEXT NOT NULL, unitCostPrice INTEGER NOT NULL, quantity INTEGER NOT NULL, totalCost INTEGER NOT NULL, FOREIGN KEY (purchaseID) REFERENCES purchase_details_table(purchaseID) ON DELETE CASCADE)`;
    try {
      db.run(purchasedItemsTableQuery);
      console.log("Table Successfully Created!");
    } catch (err) {
      console.log("Error creating purchased item table", err.message);
    }
  }
  function createPurchaseView() {
    const PurchaseView = `CREATE VIEW IF NOT EXISTS purchase AS SELECT * FROM purchase_details_table INNER JOIN purchased_items_table ON purchase_details_table.purchaseID = purchased_items_table.purchaseID`;
    try {
      db.run(PurchaseView);
      console.log("View Successfully Created!");
    } catch (err) {
      console.log("Error creating purchase view", err.message);
    }
  }
  createPurchaseDetailsTable();
  createPurchasedItemsTable();
  createPurchaseView();
}
function createSalesTable() {
  function createSalesDetailsTable() {
    const salesTableQuery = `CREATE TABLE IF NOT EXISTS sales_details_table(saleID INTEGER PRIMARY KEY, dateSold DATE NOT NULL, saleAmount INTEGER NOT NULL, voucherValue INTEGER)`;
    try {
      db.run(salesTableQuery);
      console.log("Table Successfully Created!");
    } catch (err) {
      console.log("Error creating sales details table", err.message);
    }
  }
  function createSoldItemsTable() {
    const soldItemsQuery = `CREATE TABLE IF NOT EXISTS sold_items_table(soldItemsID INTEGER PRIMARY KEY, saleID INTEGER NOT NULL, itemName TEXT NOT NULL, unitCost INTEGER NOT NULL, quantity INTEGER NOT NULL, totalCost INTEGER NOT NULL, FOREIGN KEY (saleID) REFERENCES sales_details_table(saleID) ON DELETE CASCADE, UNIQUE (saleID, itemName)) `;
    try {
      db.run(soldItemsQuery);
      console.log("Table Successfully Created!");
    } catch (err) {
      console.log("Error creating sold items table", err.message);
    }
  }
  function createSalesView() {
    const salesView = `CREATE VIEW IF NOT EXISTS sales AS SELECT * FROM sales_details_table INNER JOIN sold_items_table ON sales_details_table.saleID = sold_items_table.saleID`;
    try {
      db.run(salesView);
      console.log("View Successfully Created!");
    } catch (err) {
      console.log("Error creating sales view", err.message);
    }
  }
  createSalesDetailsTable();
  createSoldItemsTable();
  createSalesView();
}
// INVENTORY CRUD
function createInventoryItems(itemName, quantity, price) {
  return new Promise((resolve, reject) => {
    const addItemsQuery = `INSERT INTO inventory_table(itemName, quantity, price) VALUES (?, ?, ?)`;
    db.run(addItemsQuery, [itemName, quantity, price], function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
}
function readInventoryItems() {
  return new Promise((resolve, reject) => {
    const viewStockQuery = `SELECT * FROM inventory_table`;
    db.all(viewStockQuery, [], function (err, rows) {
      if (err) {
        console.log(err.message);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}
function updateInventoryItem(id, itemName, quantity, price) {
  return new Promise((resolve, reject) => {
    const updateItemsQuery = `UPDATE inventory_table SET itemName = ?, quantity = ?, price = ? WHERE id = ?`;
    db.run(updateItemsQuery, [itemName, quantity, price, id], function (err) {
      if (err) {
        console.log(err.message);
        reject(err);
      } else {
        console.log("Successfully Updated!");
        resolve(id);
      }
    });
  });
}
function deleteInventoryItem(id, itemName) {
  return new Promise((resolve, reject) => {
    const deleteQuery = `DELETE FROM inventory_table WHERE id = ? OR itemName = ?`;
    db.run(deleteQuery, [id, itemName], function (err) {
      if (err) {
        console.log(err.message);
        reject(err);
      } else {
        console.log("deleted Successfully");
        resolve(id);
      }
    });
  });
}
// PURCHASE CRUD
function createPurchase(
  vendor,
  totalPurchaseCost,
  purchaseDate,
  itemName,
  unitCostPrice,
  quantity,
  totalCost
) {
  return new Promise((resolve, reject) => {
    const purchaseDetailsQuery = `INSERT INTO purchase_details_table(vendor, totalPurchaseCost, purchaseDate) VALUES (?, ?, ?)`;
    db.run(
      purchaseDetailsQuery,
      [vendor, totalPurchaseCost, purchaseDate],
      function (err) {
        if (err) {
          console.log(err.message);
          return reject(err);
        }
        const newPurchaseID = this.lastID;
        const recordPurchasesQuery = `INSERT INTO purchased_items_table(purchaseID, itemName, unitCostPrice, quantity, totalCost) VALUES (?, ?, ?, ?, ?)`;
        db.run(
          recordPurchasesQuery,
          [newPurchaseID, itemName, unitCostPrice, quantity, totalCost],
          function (err) {
            if (err) return reject(err);
            console.log("Purchase recorded successfully!");
            resolve(newPurchaseID);
          }
        );
      }
    );
  });
}
function readPurchases() {
  return new Promise((resolve, reject) => {
    const purchaseView = `SELECT * FROM purchase`;
    db.all(purchaseView, function (err, rows) {
      if (err) {
        console.log(err.message);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}
function updatePurchase(
  vendor,
  totalPurchaseCost,
  purchaseID,
  purchaseDate,
  itemName,
  unitCostPrice,
  quantity,
  totalCost,
  purchasedItemID
) {
  return new Promise((resolve, reject) => {
    // Update purchase details
    const updatePurchaseDetailsQuery = `UPDATE purchase_details_table SET vendor = ?, totalPurchaseCost = ?, purchaseDate = ? WHERE purchaseID = ?`;
    db.run(
      updatePurchaseDetailsQuery,
      [vendor, totalPurchaseCost, purchaseDate, purchaseID],
      function (err) {
        if (err) {
          console.log("Error updating purchase details:", err.message);
          return reject(err);
        }
      }
    );
    // Update purchased item details
    const updatePurchasedItemQuery = `UPDATE purchased_items_table SET purchaseID = ?, itemName = ?, unitCostPrice = ?, quantity = ?, totalCost = ? WHERE purchasedItemID = ?`;
    db.run(
      updatePurchasedItemQuery,
      [
        purchaseID,
        itemName,
        unitCostPrice,
        quantity,
        totalCost,
        purchasedItemID,
      ],
      function (err) {
        if (err) {
          console.log("Error updating purchased item:", err.message);
          return reject(err);
        }
        console.log("Purchased Item Successfully Updated!");
        resolve(purchaseID);
      }
    );
  });
}
function deletePurchase(purchaseID, purchasedItemID) {
  return new Promise((resolve, reject) => {
    const deletePurchasedItemQuery = `DELETE FROM purchased_items_table WHERE purchasedItemID = ?`;
    db.run(deletePurchasedItemQuery, [purchasedItemID], function (err) {
      if (err) {
        console.log(err.message);
        return reject(err);
      }
      console.log("Purchased Item Successfully Deleted!");
      const deletePurchaseDetailsQuery = `DELETE FROM purchase_details_table WHERE purchaseID = ?`;
      db.run(deletePurchaseDetailsQuery, [purchaseID], function (err) {
        if (err) {
          console.log(err.message);
          return reject(err);
        }
        console.log("Purchase Details Successfully Deleted!");
        resolve(purchaseID);
      });
    });
  });
}
//SALES CRUD
function recordSale(
  saleAmount,
  voucherValue,
  ItemName,
  unitCost,
  quantity,
  totalCost,
  dateSold
) {
  return new Promise((resolve, reject) => {
    const recordSaleQuery = `INSERT INTO sales_details_table(saleAmount, voucherValue, dateSold) VALUES(?, ?, ?)`;
    db.run(
      recordSaleQuery,
      [saleAmount, voucherValue, dateSold],
      function (err) {
        if (err) {
          console.log(err.message);
          return reject(err);
        }
        const newSaleID = this.lastID;
        const recordSoldItemsQuery = `INSERT INTO sold_items_table(saleID,ItemName, unitCost, quantity, totalCost) VALUES (?, ?, ?, ?, ?)`;

        db.run(
          recordSoldItemsQuery,
          [newSaleID, ItemName, unitCost, quantity, totalCost],
          function (err) {
            if (err) {
              console.log(err.message);
              return reject(err);
            }
            console.log("Sold Item Successfully Added!");
            resolve(newSaleID);
          }
        );
      }
    );
  });
}
function readSales() {
  return new Promise((resolve, reject) => {
    const view = `SELECT * FROM sales`;
    db.all(view, (err, rows) => {
      if (err) {
        console.log(err.message);
        return reject(err);
      }
      console.log("View Created Successfully", rows);
      resolve(rows);
    });
  });
}
function updateSales(
  saleAmount,
  voucherValue,
  saleID,
  ItemName,
  unitCost,
  quantity,
  totalCost,
  soldItemID
) {
  return new Promise((resolve, reject) => {
    const updateSaleDetailsQuery = `UPDATE sales_details_table SET saleAmount = ?, voucherValue = ? WHERE saleID = ?`;
    const updateSaleQuery = `UPDATE sold_items_table SET saleID = ?, itemName = ?, unitCost = ?, quantity = ?, totalCost = ? WHERE soldItemID = ?`;
    db.run(
      updateSaleDetailsQuery,
      [saleAmount, voucherValue, saleID],
      (err) => {
        if (err) {
          console.log(err.message);
          return reject(err);
        }
        console.log("Sale Details Successfully Updated!");
        db.run(
          updateSaleQuery,
          [saleID, ItemName, unitCost, quantity, totalCost, soldItemID],
          (err) => {
            if (err) {
              console.log(err.message);
              return reject(err);
            }
            console.log("Sold Item Successfully Updated!");
            resolve("Sale updated successfully");
          }
        );
      }
    );
  });
}
function deleteSale(saleID, soldItemID) {
  return new Promise((resolve, reject) => {
    const deleteSoldItemQuery = `DELETE FROM sold_items_table WHERE soldItemID = ?`;
    db.run(deleteSoldItemQuery, [soldItemID], (err) => {
      if (err) {
        console.log(err.message);
        return reject(err);
      }
      console.log("Sold Item Successfully Deleted!");
      const deleteSaleQuery = `DELETE FROM sales_details_table WHERE saleID = ?`;
      db.run(deleteSaleQuery, [saleID], (err) => {
        if (err) {
          console.log(err.message);
          return reject(err);
        }
        console.log("Sale Details Successfully Deleted");
        resolve("Sale deleted successfully");
      });
    });
  });
}
function closeDatabase() {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        console.log(err.message);
        reject(err);
      } else {
        console.log("Database connection closed");
        resolve();
      }
    });
  });
}

export {
  initializeDB,
  createInventoryItems,
  readInventoryItems,
  updateInventoryItem,
  deleteInventoryItem,
  createPurchase,
  readPurchases,
  updatePurchase,
  deletePurchase,
  recordSale,
  readSales,
  updateSales,
  deleteSale,
  closeDatabase,
};
