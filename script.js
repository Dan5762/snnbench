// script.js
// Renders the benchmark table from data/datasets.json and data/papers.json.

const SORTABLE_COLUMNS = {
  2: { key: 'last_revised_date', type: 'date' },
  3: { key: 'neuron_count', type: 'number' },
  4: { key: 'accuracy', type: 'number' },
};

const approachOptions = [
  "All",
  "Supervised Learning",
  "Unsupervised Learning",
  "Reinforcement Learning",
  "Hybrid Approaches",
  "Spike-Based Backpropagation Variants",
  "Reservoir Computing and Liquid State Machines",
];

const datasetSelect = document.getElementById('dataset-select');
const approachSelect = document.getElementById('approach-select');

let selectedDataset = "MNIST";
let selectedApproach = "All";

// Sorted rows currently shown, plus the active sort state.
let currentApproaches = [];
let activeSort = { colIndex: 4, direction: 'desc' };

// Cache the fetched JSON so we don't re-request on every filter change.
let datasetsCache = null;
let papersCache = null;

const fetchData = async (filePath, cacheRef) => {
  if (cacheRef && cacheRef.value) return cacheRef.value;
  try {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (cacheRef) cacheRef.value = data;
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
};

const datasetsRef = { value: null };
const papersRef = { value: null };

const getDatasets = () => fetchData("./data/datasets.json", datasetsRef);
const getPapers = () => fetchData("./data/papers.json", papersRef);

// Compare helper that always pushes null/undefined to the bottom.
const compareValues = (a, b, type, direction) => {
  const missingA = a === null || a === undefined || a === '';
  const missingB = b === null || b === undefined || b === '';
  if (missingA && missingB) return 0;
  if (missingA) return 1;
  if (missingB) return -1;

  let valA = a;
  let valB = b;
  if (type === 'date') {
    valA = new Date(a).getTime();
    valB = new Date(b).getTime();
  }
  return direction === 'asc' ? valA - valB : valB - valA;
};

const sortApproaches = () => {
  const { colIndex, direction } = activeSort;
  const { key, type } = SORTABLE_COLUMNS[colIndex];
  currentApproaches.sort((a, b) => compareValues(a[key], b[key], type, direction));
};

const updateSortIndicators = () => {
  const indicators = document.querySelectorAll('.sort-indicator');
  const colMap = { 2: 0, 3: 1, 4: 2 };
  indicators.forEach((ind, i) => {
    ind.classList.remove('up', 'down', 'inactive');
    if (i === colMap[activeSort.colIndex]) {
      ind.classList.add(activeSort.direction === 'asc' ? 'up' : 'down');
    } else {
      ind.classList.add('inactive');
    }
  });
};

const renderApproaches = () => {
  const tableBody = document.querySelector('table tbody');
  tableBody.innerHTML = '';

  const fragment = document.createDocumentFragment();
  currentApproaches.forEach((row) => {
    const tableRow = document.createElement('tr');
    tableRow.tabIndex = 0;
    tableRow.setAttribute('role', 'link');
    if (row.paper) tableRow.setAttribute('aria-label', `${row.title} — open paper`);

    const year = row.last_revised_date
      ? new Date(row.last_revised_date).getFullYear()
      : '';
    const accuracy = (row.accuracy === null || row.accuracy === undefined)
      ? '—'
      : row.accuracy;

    const cells = [
      ['Title', row.title],
      ['Authors', row.authors],
      ['Year', year],
      ['Neuron Count', row.neuron_count],
      ['Accuracy', accuracy],
    ];
    cells.forEach(([label, value]) => {
      const td = document.createElement('td');
      td.setAttribute('data-label', label);
      td.textContent = value ?? '';
      tableRow.appendChild(td);
    });

    if (row.paper) {
      const openPaper = () => { window.location.href = row.paper; };
      tableRow.addEventListener('click', openPaper);
      tableRow.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openPaper();
        }
      });
    }

    fragment.appendChild(tableRow);
  });
  tableBody.appendChild(fragment);
};

// Attached once, on load. Clicking a sortable header toggles its direction.
const attachSortHandlers = () => {
  const table = document.querySelector('table');
  Object.keys(SORTABLE_COLUMNS).forEach((colIndex) => {
    const index = Number(colIndex);
    const th = table.querySelector(`th:nth-child(${index + 1})`);
    th.addEventListener('click', () => {
      if (activeSort.colIndex === index) {
        activeSort.direction = activeSort.direction === 'asc' ? 'desc' : 'asc';
      } else {
        activeSort = { colIndex: index, direction: 'desc' };
      }
      sortApproaches();
      updateSortIndicators();
      renderApproaches();
    });
  });
};

const populateDatasetTable = async () => {
  const papers = await getPapers();

  const approaches = [];
  papers.forEach((paper) => {
    paper.approaches.forEach((approach) => {
      const matchesApproach = selectedApproach === "All" || approach.category === selectedApproach;
      if (matchesApproach && approach.dataset === selectedDataset) {
        approaches.push({
          ...approach,
          title: paper.title,
          authors: paper.authors,
          last_revised_date: paper.last_revised_date,
          paper: paper.paper,
        });
      }
    });
  });

  currentApproaches = approaches;
  sortApproaches();
  updateSortIndicators();
  renderApproaches();

  document.getElementById('dataset-count').textContent = `Benchmarked: ${approaches.length}`;
};

const populateDatasetDescription = async () => {
  const datasets = await getDatasets();
  const datasetInfo = datasets.find((data) => data.name === selectedDataset);
  if (!datasetInfo) return;

  const datasetSection = document.getElementById('dataset-section');
  datasetSection.style.cursor = 'pointer';
  datasetSection.onclick = () => { window.location.href = datasetInfo.url; };

  document.getElementById('dataset-name').textContent = datasetInfo.name;
  document.getElementById('dataset-description').textContent = datasetInfo.description;
};

const populateDatasetOptions = async () => {
  const datasets = await getDatasets();
  const fragment = document.createDocumentFragment();
  datasets.forEach((dataset) => {
    const option = document.createElement('option');
    option.value = dataset.name;
    option.textContent = dataset.name;
    fragment.appendChild(option);
  });
  datasetSelect.appendChild(fragment);
};

const populateApproachOptions = () => {
  const fragment = document.createDocumentFragment();
  approachOptions.forEach((approach) => {
    const option = document.createElement('option');
    option.value = approach;
    option.textContent = approach;
    fragment.appendChild(option);
  });
  approachSelect.appendChild(fragment);
};

datasetSelect.addEventListener('change', (event) => {
  selectedDataset = event.target.value;
  populateDatasetDescription();
  populateDatasetTable();
});

approachSelect.addEventListener('change', (event) => {
  selectedApproach = event.target.value;
  populateDatasetTable();
});

// Initialise.
populateApproachOptions();
attachSortHandlers();
populateDatasetOptions();
populateDatasetDescription();
populateDatasetTable();
