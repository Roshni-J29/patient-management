let patientHistory = JSON.parse(localStorage.getItem("patients")) || [];

function saveHistory(patient) {
    patientHistory.push(patient);
    localStorage.setItem("patients", JSON.stringify(patientHistory));
    displayHistory();
}

function displayHistory() {
    const historyList = document.getElementById("historyList");
    historyList.innerHTML = "";
    patientHistory.forEach((p) => {
        const li = document.createElement("li");
        li.textContent = `${p.name}, Age: ${p.age}`;
        historyList.appendChild(li);
    });
}

function getBPStatus(bp) {
    const [systolic, diastolic] = bp.split('/').map(Number);
    if(systolic<90 || diastolic<60 || systolic>140 || diastolic>90) return "abnormal";
    else if(systolic>120 || diastolic>80) return "borderline";
    return "normal";
}

function getStatus(value, vital) {
    switch(vital) {
        case "Heart Rate": return (value>=60 && value<=100) ? "normal" : "abnormal";
        case "SpO2": return (value>=95) ? "normal" : "abnormal";
        case "Blood Pressure": return getBPStatus(value);
        case "Temperature": return (value>=97 && value<=99) ? "normal" : "abnormal";
        case "Sugar Level": return (value>=70 && value<=140) ? "normal" : "abnormal";
        case "Respiratory Rate": return (value>=12 && value<=20) ? "normal" : "abnormal";
        default: return "";
    }
}

const icons = {
    "Heart Rate": "❤️",
    "SpO2": "🫁",
    "Blood Pressure": "💓",
    "Temperature": "🌡️",
    "Sugar Level": "🍬",
    "Respiratory Rate": "🫁"
};

function generateReport(patient) {
    document.getElementById("reportSection").classList.remove("hidden");
    document.getElementById("patientInfo").textContent = `Name: ${patient.name} | Age: ${patient.age}`;

    const tbody = document.querySelector("#vitalTable tbody");
    tbody.innerHTML = "";
    const vitals = {
        "Heart Rate": patient.hr + " bpm",
        "SpO2": patient.spo2 + " %",
        "Blood Pressure": patient.bp + " mmHg",
        "Temperature": patient.temp + " °F",
        "Sugar Level": patient.sugar + " mg/dL",
        "Respiratory Rate": patient.rr + " /min"
    };

    const chartLabels = [];
    const chartValues = [];
    const chartColors = [];

    for (let vital in vitals) {
        const rawValue = (vital==="Blood Pressure") ? patient.bp : parseInt(patient[vital.split(' ')[0].toLowerCase()]);
        const status = getStatus(rawValue, vital);

        const tr = document.createElement("tr");
        tr.innerHTML = `<td><span class="vital-icon">${icons[vital]}</span>${vital}</td>
                        <td>${vitals[vital]}</td>
                        <td><span class="status-indicator status-${status}"></span>${status.charAt(0).toUpperCase() + status.slice(1)}</td>`;
        tbody.appendChild(tr);

        chartLabels.push(vital);
        chartValues.push((vital==="Blood Pressure") ? parseInt(patient.bp.split('/')[0]) : parseInt(patient[vital.split(' ')[0].toLowerCase()]));
        chartColors.push(status==="normal" ? "#4caf50" : status==="borderline" ? "#ffeb3b" : "#f44336");
    }

    const ctx = document.getElementById('vitalChart').getContext('2d');
    if(window.vitalChart) window.vitalChart.destroy();
    window.vitalChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartLabels,
            datasets: [{
                label: 'Vitals',
                data: chartValues,
                backgroundColor: chartColors
            }]
        },
        options: { responsive:true, scales:{ y:{beginAtZero:true} } }
    });
}

// PDF Generation
document.getElementById("downloadPDF").addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const nameAge = document.getElementById("patientInfo").textContent;
    doc.setFontSize(14);
    doc.text(nameAge, 10, 10);

    // Table with icons and status circles
    const rows = [];
    const statusColors = [];
    document.querySelectorAll("#vitalTable tbody tr").forEach(tr => {
        const cols = [];
        tr.querySelectorAll("td").forEach(td => cols.push(td.textContent));
        rows.push(cols);

        const statusCircle = tr.querySelector(".status-indicator");
        let color = "#000000";
        if(statusCircle.classList.contains("status-normal")) color = "#4caf50";
        else if(statusCircle.classList.contains("status-borderline")) color = "#ffeb3b";
        else if(statusCircle.classList.contains("status-abnormal")) color = "#f44336";
        statusColors.push(color);
    });

    doc.autoTable({
        head: [['Vital Sign','Value','Status']],
        body: rows,
        startY: 20,
        didParseCell: function(data){
            if(data.section === 'body' && data.column.index === 2){
                data.cell.styles.textColor = doc.getTextColor();
                data.cell.styles.fillColor = [255,255,255]; // keep background white
            }
        }
    });

    // Add chart as image
    const chartCanvas = document.getElementById("vitalChart");
    const chartImg = chartCanvas.toDataURL("image/png", 1.0);
    doc.addImage(chartImg, 'PNG', 15, doc.lastAutoTable.finalY + 10, 180, 100);

    doc.save(`${document.getElementById("name").value}_Report.pdf`);
});

// Form submit
document.getElementById("patientForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const patient = {
        name: document.getElementById("name").value,
        age: document.getElementById("age").value,
        hr: document.getElementById("hr").value,
        spo2: document.getElementById("spo2").value,
        bp: document.getElementById("bp").value,
        temp: document.getElementById("temp").value,
        sugar: document.getElementById("sugar").value,
        rr: document.getElementById("rr").value
    };
    saveHistory(patient);
    generateReport(patient);
});

// Initialize history
displayHistory();
