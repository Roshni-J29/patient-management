let patientHistory = [];

// Form Submit
document.getElementById("patientForm").addEventListener("submit", function(e) {
    e.preventDefault();

    // Collect inputs
    let name = document.getElementById("name").value.trim();
    let age = document.getElementById("age").value;
    let heartRate = parseFloat(document.getElementById("heartRate").value);
    let spo2 = parseFloat(document.getElementById("spo2").value);
    let bp = document.getElementById("bp").value.trim();
    let temp = parseFloat(document.getElementById("temp").value);
    let sugar = parseFloat(document.getElementById("sugar").value);
    let resp = parseFloat(document.getElementById("resp").value);

    // Health evaluation
    let healthStatus = (heartRate >= 60 && heartRate <= 100 &&
                        spo2 >= 95 &&
                        temp >= 36.1 && temp <= 37.2 &&
                        sugar >= 70 && sugar <= 130)
                        ? "healthy" : "warning";

    let statusText = healthStatus === "healthy" ? "🟢 Healthy" : "🟡 Needs Monitoring";

    // Update report content
    let reportHTML = `
        <h3>${name} (${age} yrs)</h3>
        <p><b>Heart Rate:</b> ${heartRate} bpm</p>
        <p><b>SPO2:</b> ${spo2}%</p>
        <p><b>BP:</b> ${bp}</p>
        <p><b>Temperature:</b> ${temp} °C</p>
        <p><b>Sugar Level:</b> ${sugar} mg/dL</p>
        <p><b>Respiratory Rate:</b> ${resp} bpm</p>
        <hr>
        <p><b>Overall Health:</b> <span class="${healthStatus}">${statusText}</span></p>
    `;
    document.getElementById("report-content").innerHTML = reportHTML;

    // Save to history
    patientHistory.push({name, age, heartRate, spo2, bp, temp, sugar, resp, statusText});
    updateHistory();

    // Draw chart
    drawChart({heartRate, spo2, temp, sugar, resp});

    // Reset form
    this.reset();
});

// Update patient history
function updateHistory() {
    const historyList = document.getElementById("historyList");
    historyList.innerHTML = "";
    patientHistory.forEach((p, index) => {
        let li = document.createElement("li");
        li.textContent = `${p.name} (${p.age} yrs) - ${p.statusText}`;
        historyList.appendChild(li);
    });
}

// Draw chart using Chart.js
function drawChart(data) {
    const ctx = document.getElementById('vitalsChart').getContext('2d');
    if(window.vitalsChartInstance) window.vitalsChartInstance.destroy(); // remove old chart
    window.vitalsChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Heart Rate', 'SPO2', 'Temperature', 'Sugar', 'Respiratory Rate'],
            datasets: [{
                label: 'Vitals',
                data: [data.heartRate, data.spo2, data.temp, data.sugar, data.resp],
                backgroundColor: ['#3d5af1','#1cc88a','#f6c23e','#e74a3b','#36b9cc']
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });
}

// Download PDF
document.getElementById("downloadPdf").addEventListener("click", function(){
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let content = document.getElementById("report-content").innerText;
    doc.setFontSize(12);
    doc.text(content, 10, 10);
    doc.save("Patient_Report.pdf");
});
