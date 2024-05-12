// script.js
// Replace this with your actual data fetching logic
const fetchData = async () => {
  return [
      { column1: 'Data 1', column2: 'Data 2' },
      // More data...
  ];
};

const populateTable = async () => {
  const data = await fetchData();
  const tableBody = document.getElementById('resultsTable').getElementsByTagName('tbody')[0];

  data.forEach(rowData => {
      const row = document.createElement('tr');

      Object.values(rowData).forEach(cellData => {
          const cell = document.createElement('td');
          cell.textContent = cellData;
          row.appendChild(cell);
      });

      tableBody.appendChild(row);
  });
};

populateTable();