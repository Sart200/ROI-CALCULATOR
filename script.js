const industryEl = document.getElementById('industry');
const metricEl = document.getElementById('metric');
const trafficTypeEl = document.getElementById('trafficType');
const dynamicFields = document.getElementById('dynamicFields');
const extraRevenueField = document.getElementById('extraRevenueField');
const form = document.getElementById('roiForm');
const results = document.getElementById('results');

function renderDynamicFields() {
  dynamicFields.innerHTML = '';
  let metric = metricEl.value;
  let trafficType = trafficTypeEl.value;
  let industry = industryEl.value;

  // Show ARPU for specific industries and both metrics
  const showRevenue = [
    'Retail Banking',
    'Personal Loans',
    'Credit Cards',
    'Insurance',
    'Investment Broker',
    'Telecommunication',
    'Professional Services'
  ].includes(industry);
  extraRevenueField.style.display = showRevenue ? '' : 'none';

  // For E-commerce, lead generation is not applicable
  if (industry === 'E-commerce' && metric === 'lead') {
    dynamicFields.innerHTML = "<div style='color:red;font-weight:bold;'>Lead Generation is not available for E-commerce</div>";
    return;
  }

  if (!metric || !trafficType) return;

  let html = '';

  if (metric === "lead") {
    if (["paid", "organic", "both"].includes(trafficType)) {
      if (trafficType === "paid" || trafficType === "both") {
        html += `<div><label>Ad Spend (per month): <input required name="adSpend" type="number" step="0.01" min="0"/></label></div>`;
        html += `<div><label>Paid Traffic (visits/month): <input required name="paidTraffic" type="number" step="1" min="0"/></label></div>`;
        html += `<div>
          <label>Form Fills per month: 
            <input required name="paidFormFills" id="paidFormFills" type="number" step="1" min="0"/>
            <select name="paidFormFillsType">
              <option value="number">Number</option>
              <option value="percent">Percent of traffic</option>
            </select>
          </label>
        </div>`;
        html += `<div><label>AOV (Avg Order Value): <input required name="aov" type="number" step="0.01" min="0"/></label></div>`;
        html += `<div><label>Form to Purchase Ratio (%): <input required name="formToPurchasePaid" type="number" step="0.01" min="0" max="100"/></label></div>`;
      }
      if (trafficType === "organic" || trafficType === "both") {
        html += `<div><label>Organic Traffic (visits/month): <input required name="organicTraffic" type="number" step="1" min="0"/></label></div>`;
        html += `<div>
          <label>Form Fills per month: 
            <input required name="organicFormFills" id="organicFormFills" type="number" step="1" min="0"/>
            <select name="organicFormFillsType">
              <option value="number">Number</option>
              <option value="percent">Percent of traffic</option>
            </select>
          </label>
        </div>`;
        html += `<div><label>AOV (Avg Order Value): <input required name="aov_organic" type="number" step="0.01" min="0"/></label></div>`;
        html += `<div><label>Form to Purchase Ratio (%): <input required name="formToPurchaseOrganic" type="number" step="0.01" min="0" max="100"/></label></div>`;
      }
    }
  } else if (metric === "purchase") {
    if (trafficType === "paid" || trafficType === "both") {
      html += `<div><label>Ad Spend (per month): <input required name="adSpend" type="number" step="0.01" min="0"/></label></div>`;
      html += `<div><label>Paid Traffic (visits/month): <input required name="paidTraffic" type="number" step="1" min="0"/></label></div>`;
      html += `<div><label>Number of Purchases (Paid): <input required name="paidPurchases" type="number" step="1" min="0"/></label></div>`;
      html += `<div><label>AOV (Avg Order Value): <input required name="aov" type="number" step="0.01" min="0"/></label></div>`;
    }
    if (trafficType === "organic" || trafficType === "both") {
      html += `<div><label>Organic Traffic (visits/month): <input required name="organicTraffic" type="number" step="1" min="0"/></label></div>`;
      html += `<div><label>Number of Purchases (Organic): <input required name="organicPurchases" type="number" step="1" min="0"/></label></div>`;
      html += `<div><label>AOV (Avg Order Value): <input required name="aov_organic" type="number" step="0.01" min="0"/></label></div>`;
    }
  }
  dynamicFields.innerHTML = html;
}

// Event listeners
industryEl.addEventListener('change', renderDynamicFields);
metricEl.addEventListener('change', renderDynamicFields);
trafficTypeEl.addEventListener('change', renderDynamicFields);

function parseField(form, field, fallback=0) {
  return Number(form[field]?.value) || fallback;
}

form.addEventListener('submit', function(e) {
  e.preventDefault();
  results.innerHTML = "";
  const data = new FormData(form);
  const industry = data.get("industry");
  const metric = data.get("metric");
  const trafficType = data.get("trafficType");
  const arpu = parseFloat(data.get("arpu") || "0");

  let output = "";

  // Helper for percentage/numbers
  function getFormFills(type, traffic, trafficNumber, data) {
    const val = parseFloat(data.get(type));
    const selectType = data.get(type + "Type");
    return (selectType === "percent")
      ? (trafficNumber * val / 100)
      : val;
  }

  // ---- LEAD GENERATION LOGIC ----
  if (metric === "lead") {
    let aov, totalRevenue;
    // Paid or Both
    if (trafficType === "paid" || trafficType === "both") {
      const adSpend = parseField(data, "adSpend");
      const paidTraffic = parseField(data, "paidTraffic");
      aov = parseField(data, "aov");
      const formFills = getFormFills("paidFormFills", "paid", paidTraffic, data);
      const formToPurchase = parseField(data, "formToPurchasePaid") / 100;
      const purchases = formFills * formToPurchase;
      const revenue = purchases * aov;

      output += `<h3>Paid Traffic</h3>
      <table>
        <tr><th></th><th>Current</th><th>+10% Conversions</th><th>+15%</th><th>+20%</th></tr>
        <tr><td>Ad Spend</td><td>${adSpend.toFixed(2)}</td><td>-</td><td>-</td><td>-</td></tr>
        <tr><td>Revenue</td>
          <td>${revenue.toFixed(2)}</td>
          <td>${(revenue*1.1).toFixed(2)}</td>
          <td>${(revenue*1.15).toFixed(2)}</td>
          <td>${(revenue*1.2).toFixed(2)}</td>
        </tr>
        <tr><td>RoAS</td>
          <td>${(adSpend ? revenue/adSpend : 0).toFixed(2)}</td>
          <td>${(adSpend ? revenue*1.1/adSpend : 0).toFixed(2)}</td>
          <td>${(adSpend ? revenue*1.15/adSpend : 0).toFixed(2)}</td>
          <td>${(adSpend ? revenue*1.2/adSpend : 0).toFixed(2)}</td>
        </tr>
      </table>`;
      totalRevenue = revenue;
    }
    // Organic or Both
    if (trafficType === "organic" || trafficType === "both") {
      const organicTraffic = parseField(data, "organicTraffic");
      aov = parseField(data, "aov_organic");
      const formFills = getFormFills("organicFormFills", "organic", organicTraffic, data);
      const formToPurchase = parseField(data, "formToPurchaseOrganic") / 100;
      const purchases = formFills * formToPurchase;
      const revenue = purchases * aov;

      output += `<h3>Organic Traffic</h3>
      <table>
        <tr><th></th><th>Current</th><th>+10% Conversions</th><th>+15%</th><th>+20%</th></tr>
        <tr><td>Revenue</td>
          <td>${revenue.toFixed(2)}</td>
          <td>${(revenue*1.1).toFixed(2)}</td>
          <td>${(revenue*1.15).toFixed(2)}</td>
          <td>${(revenue*1.2).toFixed(2)}</td>
        </tr>
      </table>`;
      totalRevenue = (totalRevenue || 0) + revenue;
    }
  }
  // ---- PURCHASE LOGIC ----
  if (metric === "purchase") {
    let aov, totalRevenue = 0;
    // Paid or Both
    if (trafficType === "paid" || trafficType === "both") {
      const adSpend = parseField(data, "adSpend");
      const paidTraffic = parseField(data, "paidTraffic");
      aov = parseField(data, "aov");
      const purchases = parseField(data, "paidPurchases");
      const revenue = purchases * aov;

      output += `<h3>Paid Traffic</h3>
      <table>
        <tr><th></th><th>Current</th><th>+10% Purchases</th><th>+15%</th><th>+20%</th></tr>
        <tr><td>Ad Spend</td><td>${adSpend.toFixed(2)}</td><td>-</td><td>-</td><td>-</td></tr>
        <tr><td>Revenue</td>
          <td>${revenue.toFixed(2)}</td>
          <td>${(revenue*1.1).toFixed(2)}</td>
          <td>${(revenue*1.15).toFixed(2)}</td>
          <td>${(revenue*1.2).toFixed(2)}</td>
        </tr>
        <tr><td>RoAS</td>
          <td>${(adSpend ? revenue/adSpend : 0).toFixed(2)}</td>
          <td>${(adSpend ? revenue*1.1/adSpend : 0).toFixed(2)}</td>
          <td>${(adSpend ? revenue*1.15/adSpend : 0).toFixed(2)}</td>
          <td>${(adSpend ? revenue*1.2/adSpend : 0).toFixed(2)}</td>
        </tr>
      </table>`;
      totalRevenue += revenue;
    }
    // Organic or Both
    if (trafficType === "organic" || trafficType === "both") {
      const organicTraffic = parseField(data, "organicTraffic");
      aov = parseField(data, "aov_organic");
      const purchases = parseField(data, "organicPurchases");
      const revenue = purchases * aov;

      output += `<h3>Organic Traffic</h3>
      <table>
        <tr><th></th><th>Current</th><th>+10% Purchases</th><th>+15%</th><th>+20%</th></tr>
        <tr><td>Revenue</td>
          <td>${revenue.toFixed(2)}</td>
          <td>${(revenue*1.1).toFixed(2)}</td>
          <td>${(revenue*1.15).toFixed(2)}</td>
          <td>${(revenue*1.2).toFixed(2)}</td>
        </tr>
      </table>`;
      totalRevenue += revenue;
    }
  }

  // Show the output
  results.innerHTML = output;
});
