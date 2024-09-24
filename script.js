function solveProblem() {
    const lengthsInput = document.getElementById('lengths').value;
    const L = parseInt(document.getElementById('longStickLength').value);

    // Check if the large stick length is valid
    if (isNaN(L) || L <= 0) {
        alert('Bitte geben Sie eine gültige Länge für den großen Stick ein.');
        return;
    }

    // Split the input into an array, using both commas and whitespace as delimiters
    const lengths = lengthsInput
        .split(/[\s,]+/)  // Split by whitespace or commas
        .map(length => length.trim()) // Trim whitespace from each entry
        .filter(length => length !== '') // Remove any empty strings
        .map(Number) // Convert to numbers
        .filter(length => !isNaN(length)); // Remove any non-numeric values

    // Check if the lengths array is empty or if any length is greater than the large stick length
    if (lengths.length === 0) {
        alert('Keine gültigen Längen.');
        return;
    }

    if (lengths.some(length => length > L)) {
        alert('Einige der kleinen Maße sind größer als das große Maß.');
        return;
    }

    const result = binPacking(lengths, L);
    displayResult(result);
    document.getElementById('printButton').style.display = 'block'; // Show print button after the plan is created
}

function binPacking(lengths, L) {
    lengths.sort((a, b) => b - a);
    const bins = [];

    lengths.forEach(length => {
        let placed = false;
        for (let bin of bins) {
            if (bin.remainingSpace >= length) {
                bin.pieces.push(length);
                bin.remainingSpace -= length;
                placed = true;
                break;
            }
        }
        if (!placed) {
            bins.push({
                remainingSpace: L - length,
                pieces: [length]
            });
        }
    });

    return bins;
}

function drawBarChart(pieces, remainingSpace, container) {
    const chartWidth = 500;
    const barHeight = 30;
    const totalLength = pieces.reduce((sum, length) => sum + length, 0) + remainingSpace;
    const colors = ['#1f77b4', '#aec7e8'];

    const svg = d3.select(container)
        .append('svg')
        .attr('width', chartWidth)
        .attr('height', barHeight);

    const xScale = d3.scaleLinear()
        .domain([0, totalLength])
        .range([0, chartWidth]);

    let offsetX = 0;

    // Define the threshold for displaying lengths (10% of totalLength)
    const threshold = totalLength * 0.1;

    pieces.forEach((length, i) => {
        svg.append('rect')
            .attr('x', xScale(offsetX))
            .attr('y', 0)
            .attr('width', xScale(length))
            .attr('height', barHeight)
            .attr('fill', colors[i % colors.length]);

        // Only display the length if it is more than 10% of total length
        if (length > threshold) {
            svg.append('text')
                .attr('x', xScale(offsetX) + xScale(length) / 2)
                .attr('y', barHeight / 2 + 5)
                .attr('text-anchor', 'middle')
                .attr('fill', '#fff')
                .style('font-size', '12px')
                .text(length);
        }

        offsetX += length;
    });

    if (remainingSpace > 0) {
        svg.append('rect')
            .attr('x', xScale(offsetX))
            .attr('y', 0)
            .attr('width', xScale(remainingSpace))
            .attr('height', barHeight)
            .attr('fill', '#f78e0e');

        // Only display the remaining space if it is more than 10% of total length
        if (remainingSpace > threshold) {
            svg.append('text')
                .attr('x', xScale(offsetX) + xScale(remainingSpace) / 2)
                .attr('y', barHeight / 2 + 5)
                .attr('text-anchor', 'middle')
                .attr('fill', '#fff')
                .style('font-size', '12px')
                .text(remainingSpace);
        }
    }
}


function displayResult(bins) {
    const resultsDiv = document.getElementById('results');
    const printableCutsDiv = document.getElementById('printableCuts');
    resultsDiv.innerHTML = ''; // Clear previous results
    printableCutsDiv.innerHTML = ''; // Clear previous printable cuts

    bins.sort((a, b) => a.remainingSpace - b.remainingSpace);

    bins.forEach((bin, index) => {
        const stickContainer = document.createElement('div');
        stickContainer.classList.add('stick-result');

        stickContainer.innerHTML = `
            <div class="stick-info">
                <strong>Stück ${index + 1}</strong>
                <span class="remaining-space" style="color: ${bin.remainingSpace === 0 ? '#1f77b4' : '#f78e0e'};">
                    Verschnitt: ${bin.remainingSpace}
                </span>
            </div>
            <div class="cuts-list">Schnitte: ${bin.pieces.join(' | ')}</div>
            <div class="cuts-chart"></div>`;

        resultsDiv.appendChild(stickContainer);
        printableCutsDiv.innerHTML += `Stück ${index + 1}: Schnitte: ${bin.pieces.join(', ')}<br/>`;

        drawBarChart(bin.pieces, bin.remainingSpace, stickContainer.querySelector('.cuts-chart'));
    });
}
function printCuts() {
    const printableCutsDiv = document.getElementById('printableCuts');

    // Prepare the printable cuts based on the results displayed
    const resultsDiv = document.getElementById('results');
    const results = resultsDiv.children; // Get all children of results

    printableCutsDiv.innerHTML = ''; // Clear previous printable cuts

    // Loop through each stick result to create a line-by-line output for printing
    Array.from(results).forEach((result) => {
        const stickInfo = result.querySelector('.stick-info').innerHTML; // Get stick info
        const cutsList = result.querySelector('.cuts-list'); // Get cuts list

        printableCutsDiv.innerHTML += `<div>${stickInfo}</div>`; // Add stick info to printable div

        // Append "Schnitte:" and a newline before listing the cuts
        printableCutsDiv.innerHTML += `Schnitte:<br/>`; // Add newline after "Schnitte:"

        // Split the cuts by " | " (or any delimiter you used in the display)
        const cuts = cutsList.innerText.replace('Schnitte: ', '').split(' | '); // Split cuts into an array

        // Append each cut on a new line
        cuts.forEach((cut) => {
            printableCutsDiv.innerHTML += `${cut}<br/>`; // Append each cut with a line break
        });

        printableCutsDiv.innerHTML += `<hr style="border: none; border-top: 1px solid #ccc; margin: 10px 0;" />`; // Divider
    });

    printableCutsDiv.style.display = 'block'; // Show the printable cuts div
    window.print(); // Open the print dialog
    printableCutsDiv.style.display = 'none'; // Hide it again after printing
}