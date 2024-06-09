function addRow() {
    const inputContainer = document.getElementById("input-container");
    const newRow = document.createElement("div");
    newRow.classList.add("input-row");
    newRow.innerHTML = `
        <input type="number" class="form-control time-input" placeholder="Введите время в мин" style="flex: 1;" step="any">
        <input type="number" class="form-control concentration-input" placeholder="Введите концентрацию" style="flex: 1;" step="any">
        <button type="button" class="btn btn-danger remove-row" onclick="removeRow(this)">Удалить</button>
    `;
    inputContainer.appendChild(newRow);
}

function removeRow(button) {
    const row = button.parentElement;
    row.remove();
}

function calculateLinearRegression(dataPoints) {
    let n = dataPoints.length;
    let sumX = 0,
        sumY = 0,
        sumXY = 0,
        sumXX = 0;

    dataPoints.forEach((point) => {
        sumX += point.x;
        sumY += point.y;
        sumXY += point.x * point.y;
        sumXX += point.x * point.x;
    });

    let k = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    let b = (sumY - k * sumX) / n;

    return { k, b };
}

function formatEquation(k, b) {
    let formattedK =
        Math.abs(k) === 1 ? (k < 0 ? "-x" : "x") : `${k.toFixed(2)}x`;
    let formattedB =
        Math.abs(b) < 0.01
            ? ""
            : b < 0
            ? ` - ${Math.abs(b).toFixed(2)}`
            : ` + ${b.toFixed(2)}`;
    return `y = ${formattedK}${formattedB}`;
}

document.getElementById("data-form").addEventListener("submit", function (e) {
    e.preventDefault();
    let dataPoints = [];

    const reactionOrder = document.getElementById("reaction-order").value;
    const timeInputs = document.querySelectorAll(".time-input");
    const concentrationInputs = document.querySelectorAll(
        ".concentration-input"
    );

    const startConcentration = Number(concentrationInputs[0].value);

    let yAxisLabel;

    for (let i = 0; i < timeInputs.length; i++) {
        const timeValue = Number(timeInputs[i].value);
        const concentrationValue = Number(concentrationInputs[i].value);
        let yValue;

        if (isNaN(timeValue) || isNaN(concentrationValue)) {
            continue;
        }

        switch (reactionOrder) {
            case "0":
                yValue = concentrationValue;
                yAxisLabel = "C";
                break;
            case "1":
                yValue = Math.log(concentrationValue);
                yAxisLabel = "ln(C)";
                break;
            case "2":
                yValue = 1 / concentrationValue;
                yAxisLabel = "1/C";
                break;
            default:
                yValue = concentrationValue;
                yAxisLabel = "C";
                break;
        }

        if (!isNaN(yValue)) {
            dataPoints.push({ x: timeValue, y: yValue });
        }
    }

    if (dataPoints.length === 0) {
        alert(
            "Пожалуйста, введите корректные значения времени и концентрации."
        );
        return;
    }

    const { k, b } = calculateLinearRegression(dataPoints);
    const minX = Math.min(...dataPoints.map((p) => p.x));
    const maxX = Math.max(...dataPoints.map((p) => p.x));
    const regressionPoints = [
        { x: minX, y: k * minX + b },
        { x: maxX, y: k * maxX + b },
    ];

    document.getElementById("regression-equation").textContent = formatEquation(
        k,
        b
    );

    let ctx = document.getElementById("myChart").getContext("2d");
    new Chart(ctx, {
        type: "scatter",
        data: {
            datasets: [
                {
                    label: "Концентрация вещества",
                    data: dataPoints,
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1,
                    showLine: false,
                    fill: false,
                },
                {
                    label: "Линейная регрессия",
                    data: regressionPoints,
                    borderColor: "rgba(255, 99, 132, 1)",
                    borderWidth: 1,
                    showLine: true,
                    fill: false,
                    type: "line",
                },
            ],
        },
        options: {
            scales: {
                xAxes: [
                    {
                        type: "linear",
                        position: "bottom",
                        ticks: {
                            suggestedMin: 0,
                            suggestedMax: 10,
                            stepSize: 1,
                        },
                        scaleLabel: {
                            display: true,
                            labelString: "t (мин)",
                        },
                    },
                ],
                yAxes: [
                    {
                        ticks: {
                            suggestedMin: 0,
                            suggestedMax: 10,
                            stepSize: 1,
                        },
                        scaleLabel: {
                            display: true,
                            labelString: yAxisLabel,
                        },
                    },
                ],
            },
        },
    });
});
