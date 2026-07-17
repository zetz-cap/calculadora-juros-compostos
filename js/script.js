const form = document.getElementById("calculator-form");
const initialAmountInput = document.getElementById("initialAmount");
const monthlyContributionInput = document.getElementById("monthlyContribution");
const yearsInput = document.getElementById("years");
const annualRateInput = document.getElementById("annualRate");
const contributionTimingInput = document.getElementById("contributionTiming");
const resetButton = document.getElementById("reset-button");
const errorElement = document.getElementById("form-error");

const futureValueElement = document.getElementById("future-value");
const totalInvestedElement = document.getElementById("total-invested");
const totalInterestElement = document.getElementById("total-interest");
const resultPeriodElement = document.getElementById("result-period");

const extra100GrowthElement = document.getElementById("extra-100-growth");
const coffeeGrowthElement = document.getElementById("coffee-growth");
const restaurantGrowthElement = document.getElementById("restaurant-growth");

const DEFAULT_VALUES = {
  initialAmount: 100000,
  monthlyContribution: 2000,
  years: 20,
  annualRate: 10,
  contributionTiming: "end",
};

let investmentChart;

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactCurrencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});

function parseBrazilianCurrency(value) {
  const cleanValue = String(value)
    .replace(/\s/g, "")
    .replace(/R\$/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^0-9.-]/g, "");

  const parsedValue = Number(cleanValue);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function formatCurrencyInput(input) {
  const value = parseBrazilianCurrency(input.value);
  input.value = value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function calculateProjection({
  initialAmount,
  monthlyContribution,
  years,
  annualRate,
  contributionTiming,
}) {
  const totalMonths = years * 12;
  const monthlyRate = Math.pow(1 + annualRate / 100, 1 / 12) - 1;

  let balance = initialAmount;
  let invested = initialAmount;
  const annualData = [
    {
      year: 0,
      invested,
      earnings: balance - invested,
      balance,
    },
  ];

  for (let month = 1; month <= totalMonths; month += 1) {
    if (contributionTiming === "beginning") {
      balance += monthlyContribution;
      invested += monthlyContribution;
    }

    balance *= 1 + monthlyRate;

    if (contributionTiming === "end") {
      balance += monthlyContribution;
      invested += monthlyContribution;
    }

    if (month % 12 === 0) {
      annualData.push({
        year: month / 12,
        invested,
        earnings: balance - invested,
        balance,
      });
    }
  }

  return {
    futureValue: balance,
    totalInvested: invested,
    totalInterest: balance - invested,
    annualData,
  };
}

function validateInputs(values) {
  if (values.initialAmount < 0) {
    return "O valor inicial não pode ser negativo.";
  }
  if (values.monthlyContribution < 0) {
    return "O aporte mensal não pode ser negativo.";
  }
  if (!Number.isInteger(values.years) || values.years < 1 || values.years > 80) {
    return "Informe um período entre 1 e 80 anos.";
  }
  if (values.annualRate <= -100 || values.annualRate > 100) {
    return "Informe uma rentabilidade maior que -100% e de até 100% ao ano.";
  }
  return "";
}

function getInputValues() {
  return {
    initialAmount: parseBrazilianCurrency(initialAmountInput.value),
    monthlyContribution: parseBrazilianCurrency(monthlyContributionInput.value),
    years: Number(yearsInput.value),
    annualRate: Number(annualRateInput.value),
    contributionTiming: contributionTimingInput.value,
  };
}

function updateWhatIfCards(values, baseProjection) {
  const scenarios = [
    { extra: 100, element: extra100GrowthElement },
    { extra: 128, element: coffeeGrowthElement },
    { extra: 200, element: restaurantGrowthElement },
  ];

  scenarios.forEach(({ extra, element }) => {
    const projectionWithExtra = calculateProjection({
      ...values,
      monthlyContribution: values.monthlyContribution + extra,
    });

    const extraContributionTotal = extra * values.years * 12;
    const additionalGrowth =
      projectionWithExtra.futureValue -
      baseProjection.futureValue -
      extraContributionTotal;

    element.textContent = currencyFormatter.format(Math.max(additionalGrowth, 0));
  });
}

function updateResults(values, projection) {
  futureValueElement.textContent = currencyFormatter.format(projection.futureValue);
  totalInvestedElement.textContent = currencyFormatter.format(projection.totalInvested);
  totalInterestElement.textContent = currencyFormatter.format(projection.totalInterest);
  resultPeriodElement.textContent =
    values.years === 1 ? "ao final de 1 ano" : `ao final de ${values.years} anos`;

  updateChart(projection.annualData);
  updateWhatIfCards(values, projection);
}

function updateChart(annualData) {
  const labels = annualData.map((item) => `${item.year} ano${item.year === 1 ? "" : "s"}`);
  const investedData = annualData.map((item) => Number(item.invested.toFixed(2)));
  const earningsData = annualData.map((item) => Number(Math.max(item.earnings, 0).toFixed(2)));

  const chartData = {
    labels,
    datasets: [
      {
        label: "Valor investido",
        data: investedData,
        backgroundColor: "#5c4300",
        borderColor: "#5c4300",
        borderWidth: 0,
        borderRadius: 3,
      },
      {
        label: "Rendimentos",
        data: earningsData,
        backgroundColor: "#edc23a",
        borderColor: "#edc23a",
        borderWidth: 0,
        borderRadius: 3,
      },
    ],
  };

  if (investmentChart) {
    investmentChart.data = chartData;
    investmentChart.update();
    return;
  }

  investmentChart = new Chart(document.getElementById("investment-chart"), {
    type: "bar",
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label(context) {
              return `${context.dataset.label}: ${currencyFormatter.format(context.raw)}`;
            },
            footer(items) {
              const total = items.reduce((sum, item) => sum + Number(item.raw), 0);
              return `Patrimônio: ${currencyFormatter.format(total)}`;
            },
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          grid: {
            display: false,
          },
          ticks: {
            maxTicksLimit: 8,
            color: "#756343",
          },
        },
        y: {
          stacked: true,
          beginAtZero: true,
          grid: {
            color: "rgba(92, 67, 0, 0.10)",
          },
          ticks: {
            color: "#756343",
            callback(value) {
              return compactCurrencyFormatter.format(value);
            },
          },
        },
      },
    },
  });
}

function runCalculation() {
  const values = getInputValues();
  const errorMessage = validateInputs(values);

  errorElement.textContent = errorMessage;
  if (errorMessage) return;

  const projection = calculateProjection(values);
  updateResults(values, projection);

  if (typeof gtag === "function") {
    gtag("event", "calcular_investimento", {
      periodo_anos: values.years,
      rentabilidade_anual: values.annualRate,
      momento_aporte: values.contributionTiming,
    });
  }
}

function restoreDefaults() {
  initialAmountInput.value = DEFAULT_VALUES.initialAmount.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  monthlyContributionInput.value = DEFAULT_VALUES.monthlyContribution.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  yearsInput.value = DEFAULT_VALUES.years;
  annualRateInput.value = DEFAULT_VALUES.annualRate;
  contributionTimingInput.value = DEFAULT_VALUES.contributionTiming;
  errorElement.textContent = "";
  runCalculation();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  formatCurrencyInput(initialAmountInput);
  formatCurrencyInput(monthlyContributionInput);
  runCalculation();
});

resetButton.addEventListener("click", restoreDefaults);

[initialAmountInput, monthlyContributionInput].forEach((input) => {
  input.addEventListener("blur", () => formatCurrencyInput(input));
});

window.addEventListener("DOMContentLoaded", restoreDefaults);
