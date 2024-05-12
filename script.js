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
  console.log('OHHH')
  const dataName = document.currentScript.getAttribute('data-name');
  const filePath = `data/${dataName}.json`;
  const data = await fetchData(filePath);
  console.log(data)
  
  const table = document.querySelector('table');
  const tableBody = table.querySelector('tbody');

  data.forEach((row) => {
    const tableRow = document.createElement('tr');

    var tableCell = document.createElement('td');
    tableCell.textContent = row["title"];
    tableRow.appendChild(tableCell);

    tableCell = document.createElement('td');
    tableCell.textContent = row["authors"];
    tableRow.appendChild(tableCell);

    tableCell = document.createElement('td');
    tableCell.textContent = row["score"];
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