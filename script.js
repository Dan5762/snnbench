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

  const datasetSelect = document.getElementById('dataset-select');

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
  
  const table = document.querySelector('table');
  const tableBody = table.querySelector('tbody');
  tableBody.innerHTML = '';

  approaches.forEach((row) => {
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
  
    tableBody.appendChild(tableRow);
  });

  const datasetDescription = document.getElementById(`dataset-count`);
  datasetDescription.textContent = `Benchmarked: ${approaches.length}`;
};

const populateDatasetDescription = async () => {
  var datasets = await fetchData("./data/datasets.json");

  var datasetInfo = datasets.find((data) => data.name === selectedDataset);

  const datasetSection = document.getElementById(`dataset-section`);
  datasetSection.addEventListener('click', () => {
    window.location.href = datasetInfo.url;
  });
  datasetSection.addEventListener('mouseover', () => {
    tableRow.style.cursor = 'pointer';
  });

  const datasetTitle = document.getElementById(`dataset-name`);
  datasetTitle.textContent = datasetInfo.name;

  const datasetDescription = document.getElementById(`dataset-description`);
  datasetDescription.textContent = datasetInfo.description;
}


getDatasetOptions();
populateDatasetDescription();
populateDatasetTable();
