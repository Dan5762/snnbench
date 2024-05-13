// script.js
// fetch data from file
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

const populateTable = async () => {
  const dataName = document.currentScript.getAttribute('data-name');
  const filePath = `../data/${dataName}.json`;
  const data = await fetchData(filePath);
  
  const table = document.querySelector('table');
  const tableBody = table.querySelector('tbody');

  data.forEach((row) => {
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
};

populateTable();