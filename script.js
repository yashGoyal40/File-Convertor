let csvContent = '';
let jsonContent = '';
let currentConverter = '';

document.getElementById('fileInput').addEventListener('change', handleFile, false);

function handleFile(event) {
    const file = event.target.files[0];
    if (!file) {
        alert("Please select a file first.");
        return;
    }

    const fileType = file.type;
    const isCsv = fileType.includes("csv");
    const isJson = fileType.includes("json");

    if (currentConverter === 'csvToJson' && !isCsv) {
        alert("Please upload a CSV file for CSV to JSON conversion.");
        resetFileInput();
        return;
    } else if (currentConverter === 'jsonToCsv' && !isJson) {
        alert("Please upload a JSON file for JSON to CSV conversion.");
        resetFileInput();
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        if (currentConverter === 'csvToJson') {
            csvContent = e.target.result;
        } else if (currentConverter === 'jsonToCsv') {
            jsonContent = e.target.result;
        }
    };
    reader.readAsText(file);
}

function resetFileInput() {
    document.getElementById('fileInput').value = ''; // Reset file input
}

function showConverter(type) {
    currentConverter = type;
    document.getElementById('converter').style.display = 'block';

    // Alert user about the selected conversion type
    if (type === 'csvToJson') {
        alert("CSV to JSON selected. Please upload a CSV file.");
    } else if (type === 'jsonToCsv') {
        alert("JSON to CSV selected. Please upload a JSON file.");
    }
}

async function convertFile() {
    if (currentConverter === 'csvToJson' && csvContent) {
        // Call CSV to JSON Lambda function
        try {
            const response = await fetch('YOUR API KEY', {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: csvContent
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const json = await response.json();
            displayJson(JSON.stringify(json, null, 2));
            animate();
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
    } else if (currentConverter === 'jsonToCsv' && jsonContent) {
        // Call JSON to CSV Lambda function
        try {
            const response = await fetch("YOUR API KEY", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: jsonContent
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const csv = await response.text();
            displayJson(csv);
            animate();
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
    } else {
        alert("Please upload a file first.");
    }
}

function displayJson(data) {
    document.getElementById('output').textContent = data;
}

function animate() {
    const mainContainer = document.getElementById('mainContainer');
    const outputContainer = document.querySelector('.output-container');

    if (window.innerWidth > 768) {
        mainContainer.classList.add('animate');
        setTimeout(() => {
            outputContainer.style.display = 'block';
        }, 500);
    } else {
        outputContainer.style.display = 'block';
    }
}

function copyOutput() {
    const output = document.getElementById('output');
    const selection = window.getSelection();
    const range = document.createRange();

    range.selectNodeContents(output);
    selection.removeAllRanges();
    selection.addRange(range);

    document.execCommand('copy');
    selection.removeAllRanges();

    alert("Copied to clipboard!");
}

function downloadConvertedFile() {
    const data = document.getElementById('output').textContent;
    const blobType = currentConverter === 'csvToJson' ? 'application/json' : 'text/csv';
    const blob = new Blob([data], { type: blobType });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = currentConverter === 'csvToJson' ? 'converted.json' : 'converted.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
