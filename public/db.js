let db;
const request = indexedDB.open("budget-tracker", 1);
request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};
request.onsuccess = function (event) {
  db = event.target.result;
  // check if app is online before reading from db
  if (navigator.onLine) {
    checkDatabaseStatus();
  }
};

request.onerror = function (event) {
  console.log("Something went wrong! " + event.target.errorCode);
};

function saveRecord(dbRecord) {
  const record = db.transaction(["pending"], "readwrite");
  const store = record.objectStore("pending");
  dbRecord.className="table-danger"
  store.add(dbRecord);
}

function checkDatabaseStatus() {
  const record = db.transaction(["pending"], "readwrite");
  const store = record.objectStore("pending");
  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/record/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
        .then(response => response.json())
        .then(() => {
          // delete records if successful
          const record = db.transaction(["pending"], "readwrite");
          const store = record.objectStore("pending");
          store.clear();
        });
    }
  };
}
function deletePending() {
  console.log("Deleting Pending Records");
  const record = db.transaction(["pending"], "readwrite");
  const store = record.objectStore("pending");
  let tmpGetAll = store.getAll()
  tmpGetAll.onsuccess=function (){
    console.log(tmpGetAll.result);
    console.log("Deleted Pending Records");
    store.clear();
  }
  getOnlineRecords();
}

// listen for app coming back online
window.addEventListener("online", checkDatabaseStatus);
