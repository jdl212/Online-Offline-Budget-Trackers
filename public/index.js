let records = [];
let myChart;
function getOnlineRecords(){
  fetch("/api/record")
      .then(response => response.json())
      .then(data => {
        // save db data on global variable
        records = data;
        populateTotal();
        populateTable();
        populateChart();
      }).catch(err => {
    // fetch failed, so save in indexed db
    console.log("Error accessing :"+err);
    getOfflineRecords();
  });
}
getOnlineRecords();

function getOfflineRecords(){
  let tmpRecord = db.transaction(["pending"], "readwrite");
  let tmpStore = tmpRecord.objectStore("pending");
  let tmpGetAll = tmpStore.getAll()
  tmpGetAll.onsuccess=function (){
    records = tmpGetAll.result;
  }
  populateChart();
  populateTable();
  populateTotal();
}
function populateTotal() {
  // reduce record amounts to a single total value
  const total = records.reduce((total, t) => {
    return total + parseInt(t.value);
  }, 0);

  const totalEl = document.querySelector("#total");
  totalEl.textContent = total;
}

function populateTable() {
  const tbody = document.querySelector("#tbody");
  tbody.innerHTML = "";

  records.forEach(record => {
    // create and populate a table row
    const tr = document.createElement("tr");
    tr.className=record.className
    tr.innerHTML = `
      <td>${record.name}</td>
      <td>${record.value}</td>
    `;

    tbody.appendChild(tr);
  });
}

function populateChart() {
  // copy array and reverse it
  const reversed = records.slice().reverse();
  let sum = 0;

  // create date labels for chart
  const labels = reversed.map(t => {
    const date = new Date(t.date);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  });

  // create incremental values for chart
  const data = reversed.map(t => {
    sum += parseInt(t.value);
    return sum;
  });

  // remove old chart if it exists
  if (myChart) {
    myChart.destroy();
  }

  const ctx = document.getElementById("my-chart").getContext("2d");

  myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Total Over Time",
          fill: true,
          backgroundColor: "#2bb3ff",
          data
        }
      ]
    }
  });
}

function sendrecord(isAdding) {
  const nameEl = document.querySelector("#record-name");
  const amountEl = document.querySelector("#record-amt");
  const errorEl = document.querySelector("form .error");

  // validate form
  if (nameEl.value === "" || amountEl.value === "") {
    errorEl.textContent = "Missing Required Information";
    return;
  } else {
    errorEl.textContent = "";
  }

  // create record
  const record = {
    name: nameEl.value,
    value: amountEl.value,
    date: new Date().toISOString()
  };

  // if subtracting funds, convert amount to negative number
  if (!isAdding) {
    record.value *= -1;
  }

  // add to beginning of current array of data
  records.unshift(record);

  // re-run logic to populate ui with new record
  populateChart();
  populateTable();
  populateTotal();

  // also send to server
  fetch("/api/record", {
    method: "POST",
    body: JSON.stringify(record),
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json"
    }
  })
    .then(response => response.json())
    .then(data => {
      if (data.errors) {
        errorEl.textContent = "Missing Required Information";
      } else {
        // clear form
        nameEl.value = "";
        amountEl.value = "";
      }
    })
    .catch(err => {
      // fetch failed, so save in indexed db
      saveRecord(record);
      // clear form
      nameEl.value = "";
      amountEl.value = "";
    });
}

document.querySelector("#add-btn").addEventListener("click", function(event) {
  event.preventDefault();
  sendrecord(true);
});

document.querySelector("#sub-btn").addEventListener("click", function(event) {
  event.preventDefault();
  sendrecord(false);
});

document.querySelector("#del-btn").addEventListener("click", function(event) {
  event.preventDefault();
  deletePending();
});
