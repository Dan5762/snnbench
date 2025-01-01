// script.js
// fetch data from file

var selectedDataset = "MNIST";
var datasetOptions = [];

const datasetSelect = document.getElementById('dataset-select');
datasetSelect.addEventListener('change', (event) => {
  selectedDataset = event.target.value;
  populateDatasetDescription();
  populateDatasetTable();
});

var selectedApproach = "All";
var approachOptions = [
  "All",
  "Supervised Learning",
  "Unsupervised Learning",
  "Reinforcement Learning",
  "Hybrid Approaches",
  "Spike-Based Backpropagation Variants",
  "Reservoir Computing and Liquid State Machines",
];
const approachSelect = document.getElementById('approach-select');
approachOptions.forEach((dataset) => {
  const option = document.createElement('option');
  option.value = dataset;
  option.textContent = dataset;
  approachSelect.appendChild(option);
});
approachSelect.addEventListener('change', (event) => {
  selectedApproach = event.target.value;
  populateDatasetTable();
});


const fetchData = async (filePath) => {
  try {
    const response = await fetch(filePath);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
};

const getDatasetOptions = async () => {
  var datasets = await fetchData("./data/datasets.json");

  datasetOptions = [];
  datasets.forEach((dataset) => {
    datasetOptions.push(dataset.name);
  });

  datasetOptions.forEach((dataset) => {
    const option = document.createElement('option');
    option.value = dataset;
    option.textContent = dataset;
    datasetSelect.appendChild(option);
  });
}

const populateDatasetTable = async () => {
  var papers = await fetchData("./data/papers.json");

  console.log(papers);

  // Filter data by approach dataset
  var approaches = [];
  papers.forEach((paper) => {
    paper.approaches.forEach((approach) => {
      if (selectedApproach == "All" || approach.category === selectedApproach) {
        if (approach.dataset === selectedDataset) {
          approach["title"] = paper.title;
          approach["authors"] = paper.authors;
          approach["last_revised_date"] = paper.last_revised_date;
          approach["paper"] = paper.paper;
          
          approaches.push(approach);
        }
      }
    });
  });

  // sort data by accuracy
  approaches.sort((a, b) => {
    return b["accuracy"] - a["accuracy"];
  });

  console.log(approaches);
  
  // Store table data globally
  let currentApproaches = [];
  let sortDirections = { 2: 'desc', 3: 'desc', 4: 'desc' }; // columns for Year, Neuron Count, Accuracy

  function attachSortHandlers() {
    const table = document.querySelector('table');
    // For each sortable column: Year(2), Neuron(3), Accuracy(4)
    [2, 3, 4].forEach((colIndex) => {
      table.querySelector(`th:nth-child(${colIndex+1})`)
        .addEventListener('click', () => sortColumn(colIndex));
    });
  }

  function sortColumn(colIndex) {
    console.log('Sorting column index:', colIndex, 'Current direction:', sortDirections[colIndex]);
    // Flip sort direction
    sortDirections[colIndex] = sortDirections[colIndex] === 'asc' ? 'desc' : 'asc';
    console.log('New direction for column:', colIndex, 'is now:', sortDirections[colIndex]);
  
    currentApproaches.sort((a, b) => {
      const valA = colIndex === 2 ? new Date(a.last_revised_date) : a[colIndex === 3 ? 'neuron_count' : 'accuracy'];
      const valB = colIndex === 2 ? new Date(b.last_revised_date) : b[colIndex === 3 ? 'neuron_count' : 'accuracy'];
      return sortDirections[colIndex] === 'asc' ? valA - valB : valB - valA;
    });

    const table = document.querySelector('table');
    const colMap = { 2: 0, 3: 1, 4: 2 };
    const indicators = table.querySelectorAll('.sort-indicator');

    console.log('Indicators found:', indicators.length);
    indicators.forEach((ind, i) => {
      console.log('Before update -> Indicator index:', i, 'Class list:', ind.classList);
      ind.classList.remove('up','down','inactive');
      if (i === colMap[colIndex]) {
        if (sortDirections[colIndex] === 'asc') {
          ind.classList.add('up');
        } else {
          ind.classList.add('down');
        }
      } else {
        ind.classList.add('inactive');
      }
      console.log('After update -> Indicator index:', i, 'Class list:', ind.classList);
    });

    console.log('sortDirections:', sortDirections);
    renderApproaches(); // Rebuild table rows
  }

  // Rebuild table rows using currentApproaches
  function renderApproaches() {
    const tableBody = document.querySelector('table tbody');
    tableBody.innerHTML = '';
    currentApproaches.forEach((row) => {
      const tableRow = document.createElement('tr');

      var tableCell = document.createElement('td');
      tableCell.setAttribute('data-label', 'Title');
      tableCell.textContent = row["title"];
      tableRow.appendChild(tableCell);

      var tableCell = document.createElement('td');
      tableCell.setAttribute('data-label', 'Authors');
      tableCell.textContent = row["authors"];
      tableRow.appendChild(tableCell);

      var tableCell = document.createElement('td');
      tableCell.setAttribute('data-label', 'Year');
      const datetime = new Date(row["last_revised_date"]);
      tableCell.textContent = datetime.getFullYear();
      tableRow.appendChild(tableCell);

      var tableCell = document.createElement('td');
      tableCell.setAttribute('data-label', 'Neuron Count');
      tableCell.textContent = row["neuron_count"];
      tableRow.appendChild(tableCell);

      var tableCell = document.createElement('td');
      tableCell.setAttribute('data-label', 'Accuracy');
      tableCell.textContent = row["accuracy"];
      tableRow.appendChild(tableCell);

      tableRow.addEventListener('click', () => {
        window.location.href = row["paper"];
      });

      tableRow.addEventListener('mouseover', () => {
        tableRow.style.cursor = 'pointer';
      });

      // Make sure any use of tableRow (e.g., event listeners) stays inside this block
      tableBody.appendChild(tableRow);
    });
  }

  currentApproaches = approaches;
  renderApproaches();
  attachSortHandlers();

  const datasetDescription = document.getElementById(`dataset-count`);
  datasetDescription.textContent = `Benchmarked: ${approaches.length}`;
};

const populateDatasetDescription = async () => {
  var datasets = await fetchData("./data/datasets.json");

  var datasetInfo = datasets.find((data) => data.name === selectedDataset);

  const datasetSection = document.getElementById(`dataset-section`);
  datasetSection.style.cursor = 'pointer';
  datasetSection.addEventListener('click', () => {
    window.location.href = datasetInfo.url;
  });

  const datasetTitle = document.getElementById(`dataset-name`);
  datasetTitle.textContent = datasetInfo.name;

  const datasetDescription = document.getElementById(`dataset-description`);
  datasetDescription.textContent = datasetInfo.description;
}


getDatasetOptions();
populateDatasetDescription();
populateDatasetTable();
