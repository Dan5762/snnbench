// count_datasets.js
// This script counts the number of datasets in each json benchmark file and populates html tags with the id `{benchmark name}-count` with the number of datasets in the corresponding json file. The script is executed when the page is loaded.

BENCHMARKS = [
  'asl-dvs',
  'cifar10-dvs',
  'dvs-gesture',
  'google_speech_commands_v2',
  'mnist',
  'n-mnist',
  'spiking_heidelberg_digits',
  'es-imagenet',
  'hardvs',
  'n-caltech101',
  'nav-gesture',
]

const countDatasets = async () => {
  for (const benchmark of BENCHMARKS) {
    console.log(benchmark)
    const filePath = `../data/${benchmark}.json`;
    const response = await fetch(filePath);
    const data = await response.json();
    const count = data.length;
    const element = document.getElementById(`${benchmark}-count`);
    element.textContent = `Datasets: ${count}`;
  }
}

countDatasets();