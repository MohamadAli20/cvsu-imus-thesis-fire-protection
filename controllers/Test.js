class Test{

    test(newData){
    // Sample historical fire incident data with frequencies
    const historicalData = [
        { lgu: "Amadeo", frequency: 2 },
        { lgu: "Bacoor", frequency: 54 },
        { lgu: "Carmona", frequency: 50 },
        { lgu: "Dasmarinas", frequency: 160 },
        { lgu: "General Emilio Aguinaldo", frequency: 6 },
        { lgu: "General Mariano Alvarez", frequency: 3 },
        { lgu: "General Trias", frequency: 156 },
        { lgu: "Imus", frequency: 62 },
        { lgu: "Indang", frequency: 10 },
        { lgu: "Kawit", frequency: 51 },
        { lgu: "Magallanes", frequency: 19 },
        { lgu: "Maragondon", frequency: 149 },
        { lgu: "Naic", frequency: 235 },
        { lgu: "Noveleta", frequency: 5 },
        { lgu: "Rosario", frequency: 44 },
        { lgu: "Silang", frequency: 85 },
        { lgu: "Tagaytay", frequency: 4 },
        { lgu: "Tanza", frequency: 164 },
        { lgu: "Ternate", frequency: 11 },
        { lgu: "Trece Martires", frequency: 96 }
    ];

    // Function to calculate quantiles
    function calculateQuantiles(data, quantiles) {
        // Sort the data in ascending order
        const sortedData = data.slice().sort((a, b) => a - b);
        const results = {};

        quantiles.forEach(q => {
            const pos = (sortedData.length - 1) * q;
            const base = Math.floor(pos);
            const rest = pos - base;
            results[q] = sortedData[base] + rest * (sortedData[base + 1] - sortedData[base]);
        });

        return results;
    }

    // Extract frequencies from historical data
    const frequencies = historicalData.map(entry => entry.frequency);

    // Calculate quantiles (25th, 50th, and 75th percentiles)
    const quantiles = calculateQuantiles(frequencies, [0.25, 0.5, 0.75]);
    const lowRiskThreshold = quantiles[0.25];
    const moderateRiskThreshold = quantiles[0.5];
    const highRiskThreshold = quantiles[0.75];

    console.log('Low risk threshold:', lowRiskThreshold);
    console.log('Moderate risk threshold:', moderateRiskThreshold);
    console.log('High risk threshold:', highRiskThreshold);

    // Function to classify risk level based on frequency
    function classifyRisk(frequency) {
        if (frequency < lowRiskThreshold) {
            return 'low';
        } else if (frequency >= lowRiskThreshold && frequency <= moderateRiskThreshold) {
            return 'moderate';
        } else {
            return 'high';
        }
    }

    // Example new data for Amadeo
    // const newData = "Imus";
    const newFrequency = historicalData.find(entry => entry.lgu === `${newData}`).frequency;
    const newRiskLevel = classifyRisk(newFrequency);

    return {riskLevel: newRiskLevel, lowRiskThreshold: lowRiskThreshold, moderateRiskThreshold: moderateRiskThreshold, highRiskThreshold: highRiskThreshold };
    }
}

module.exports = new Test();