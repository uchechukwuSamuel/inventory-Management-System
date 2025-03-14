import * as db from "./Database.js";
console.log(db);
db.initializeDB();

document.addEventListener("DOMContentLoaded", function () {
  let pageID = document.body.id;
  if (pageID == "inventoryPage") {
    runInventoryFunctions();
  } else if (pageID == "purchasesPage") {
    runPurchasesFunctions();
  } else if (pageID == "salesPage") {
    runSalesFunctions();
  }
});

function runInventoryFunctions() {
  document
    .getElementById("addItemButton")
    .addEventListener("click", function (event) {
      event.preventDefault();
      addItem();
    });
  document.addEventListener("DOMContentLoaded", function () {
    showInventoryTable();
  });

  // Add Item to Inventory
  const formEl = document.getElementById("addItemForm");
  const tbodyEl = document.getElementById("inventoryList");
  async function addItem() {
    const itemId = document.getElementById("itemId").value;
    const itemName = document.getElementById("itemName").value;
    const quantity = Number(document.getElementById("quantity").value);
    const price = Number(document.getElementById("price").value);
    if (!itemId) {
      alert("Please Provide Item ID.");
      return;
    }
    if (!itemName) {
      alert("Please Provide Item Name.");
      return;
    }
    if (isNaN(quantity) || quantity <= 0) {
      alert("Please Provide Quantity.");
      return;
    }
    if (isNaN(price) || price <= 0) {
      alert("Please Provide Price.");
      return;
    }
    try {
      await db.createInventoryItems(itemId, itemName, quantity, price);
      showInventoryTable();
      formEl.reset();
      alert("Item successfully added to inventory.");
      console.log("Item added:", { itemId, itemName, quantity, price });
    } catch (err) {
      console.error("Error Adding Item to Inventory", err);
      alert("Error Adding item to inventory");
    }
  }
  // View Inventory
  async function showInventoryTable() {
    tbodyEl.innerHTML = "";
    await db
      .readInventoryItems()
      .then((inventoryItems) => {
        inventoryItems.forEach((inventoryItem) => {
          tbodyEl.innerHTML += `
      <tr data-item-id="${inventoryItem.itemId}">
        <td>${inventoryItem.itemId}</td>
        <td>${inventoryItem.itemName}</td>
        <td>${inventoryItem.quantity}</td>
        <td>${inventoryItem.price}</td>
        <td><button class="btn btn-danger btn-sm"><i class="bi bi-trash"></i></button></td>
        <td><button class="btn btn-warning btn-sm edit-btn"><i class="bi bi-pencil"></i></button></td>
      </tr>`;
        });
      })
      .catch((err) => {
        console.error("Error Loading Inventory", err);
        alert("Error Loading Inventory");
      });
  }
  //Update an Inventory Item
  async function updateItemDetails(itemId, itemName, quantity, price) {
    try {
      await db.updateInventoryItem(itemId, itemName, quantity, price);
      const row = document.querySelector(`tr[data-item-id="${itemId}"]`);
      if (row) {
        const cells = row.querySelectorAll("td");
        cells[1].textContent = itemName;
        cells[2].textContent = quantity;
        cells[3].textContent = price;
      }
      alert("Inventory updated successfully.");
    } catch (err) {
      console.error("Error Updating Item Details", err);
      alert("Error Updating Item Details");
    }
  }
  // Delete Inventory Item
  tbodyEl.addEventListener("click", function (event) {
    const button = event.target.closest(".btn-danger");
    if (button) {
      const row = button.closest("tr");
      const itemId = row.cells[0].textContent.trim();
      if (confirm("Are you sure you want to delete this item?")) {
        db.deleteInventoryItem(itemId)
          .then(() => {
            row.remove();
            alert("Item successfully removed from inventory.");
          })
          .catch((err) => {
            console.error("Error Deleting Item", err);
            alert("Error Deleting Item");
          });
      }
    }
  });
}
function runPurchasesFunctions() {
  // ADD PURCHASE

  async function addPurchase() {
    const vendor = document.getElementById("vendorName").value.trim();
    const totalPurchaseCost = Number(
      document.getElementById("purchaseCost").value
    );
    const purchaseDate = document.getElementById("purchaseDate").value;
    const itemName = document.getElementById("itemName").value.trim();
    const unitCostPrice = Number(
      document.getElementById("unitCostPrice").value
    );
    const quantity = Number(document.getElementById("quantity").value);
    if (!vendor) {
      alert("Please provide a valid Vendor name.");
      return;
    }
    if (isNaN(totalPurchaseCost) || totalPurchaseCost <= 0) {
      alert("Please provide the purchase cost.");
      return;
    }
    if (!purchaseDate) {
      alert("Please provide a valid purchase date.");
      return;
    }
    if (!itemName) {
      alert("Please provide the item name.");
      return;
    }
    if (isNaN(quantity) || quantity <= 0) {
      alert("Please provide the quantity.");
      return;
    }
    if (isNaN(unitCostPrice) || unitCostPrice <= 0) {
      alert("Please provide the unit cost price.");
      return;
    }
    await db
      .createPurchase(
        vendor,
        totalPurchaseCost,
        purchaseDate,
        itemName,
        unitCostPrice,
        quantity
      )
      .then(() => {
        showPurchaseTable();
        alert("Purchase added successfully.");
        document.getElementById("addPurchaseForm").reset();
      })
      .catch((err) => {
        console.error("Error adding purchase", err);
        alert("Error adding purchase");
      });
  }
  document
    .getElementById("addPurchaseForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      addPurchase();
    });
  //READ PURCHASE
  async function showPurchaseTable() {
    document.getElementById("purchaseList").innerHTML = "";
    await db
      .readPurchases()
      .then((purchaseItems) => {
        purchaseItems.forEach((purchaseItems) => {
          document.getElementById("purchaseList").innerHTML += `
          <tr data-item-id="${purchaseItems.vendor}">
            <td>${purchaseItems.totalPurchaseCost}</td>
            <td>${purchaseItems.purchaseDate}</td>
            <td>${purchaseItems.itemName}</td>
            <td>${purchaseItems.unitCostPrice}</td>
            <td>${purchaseItems.quantity}</td>
            <td><button class="btn btn-danger btn-sm"><i class="bi bi-trash"></i></button></td>
          </tr>`;
        });
      })
      .catch((err) => {
        console.error("Erorr Loading Purchase", err);
        alert("Error Loading Purchase");
      });
  }

  //UPdATE PURCHASES
  async function updatePurchaseItemDetails(
    vendor,
    totalPurchaseCost,
    purchaseID,
    purchaseDate,
    itemName,
    unitCostPrice,
    quantity,
    purchasedItemID
  ) {
    await db
      .updatePurchase(
        vendor,
        totalPurchaseCost,
        purchaseID,
        purchaseDate,
        itemName,
        unitCostPrice,
        quantity,
        purchasedItemID
      )
      .then(() => {
        const row = document.querySelector(`tr[data-item-id= "${itemId}"]`);
        if (row) {
          const cells = row.querySelectorAll("td");
          cells[1].textContent = vendor;
          cells[2].textContent = totalPurchaseCost;
          cells[3].textContent = purchaseDate;
          cells[4].textContent = itemName;
          cells[5].textContent = unitCostPrice;
          cells[6].textContent = quantity;
        }
        alert("Purchase Details updated successfully.");
      })
      .catch((err) => {
        console.error("Error Updating Purchase Item Details", err);
        alert("Error Updating Purchase Item Details");
      });
  }
  document
    .getElementById("purchasesPage")
    .addEventListener("click", function (event) {
      const button = event.target.closest(".edit-btn");
      if (button) {
        const row = button.closest("tr");
        const itemId = row.cells[0].textContent.trim();
        const itemName = row.cells[1].textContent.trim();
        const quantity = row.cells[2].textContent.trim();
        const price = row.cells[3].textContent.trim();

        const newItemName = prompt("Enter new item name:", itemName);
        const newQuantity = prompt("Enter new quantity:", quantity);
        const newPrice = prompt("Enter new price:", price);

        if (newItemName && !isNaN(newQuantity) && !isNaN(newPrice)) {
          updatePurchaseItemDetails(
            itemId,
            newItemName,
            Number(newQuantity),
            Number(newPrice)
          );
        } else {
          alert("Invalid input. Please enter valid values.");
        }
      }
    });

  //dELETE PURCHASES
}
function runSalesFunctions() {
  // --- Sales Management ---
  function addSales(event) {
    event.preventDefault();
    const saleAmount = Number(document.getElementById("sale-amount").value);
    const voucherValue = Number(document.getElementById("voucher-value").value);
    const itemName = document.getElementById("sale-item-name").value;
    const unitCost = Number(document.getElementById("sale-unit-cost").value);
    const quantity = Number(document.getElementById("sale-quantity").value);
    const totalCost = unitCost * quantity;
    db.recordSale(
      saleAmount,
      voucherValue,
      itemName,
      unitCost,
      quantity,
      totalCost
    );
    alert("Sale recorded successfully.");
  }
  //READ
  async function showPurchaseTable() {
    document.getElementById("purchaseList").innerHTML = "";
    await db
      .readPurchases()
      .then((purchaseItems) => {
        purchaseItems.forEach((purchaseItems) => {
          document.getElementById("purchaseList").innerHTML += `
          <tr data-item-id="${purchaseItems.vendor}">
            <td>${purchaseItems.totalPurchaseCost}</td>
            <td>${purchaseItems.purchaseDate}</td>
            <td>${purchaseItems.itemName}</td>
            <td>${purchaseItems.unitCostPrice}</td>
            <td>${purchaseItems.quantity}</td>
            <td><button class="btn btn-danger btn-sm"><i class="bi bi-trash"></i></button></td>
          </tr>`;
        });
      })
      .catch((err) => {
        console.error("Erorr Loading Purchase", err);
        alert("Error Loading Purchase");
      });
  }

  //Update
  //dELETE
}
