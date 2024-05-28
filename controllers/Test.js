const ml = require('ml');

// Sample historical fire incident data with features and risk levels
// const historicalData = [
        //     { "lgu": "Amadeo", "frequency":2},
        //     { "lgu": "Bacoor", "frequency":54},
        //     { "lgu": "Carmona", "frequency":50},
        //     { "lgu": "Dasmarinas", "frequency":160},
        //     { "lgu": "General Emilio Aguinaldo", "frequency":6},
        //     { "lgu": "General Mariano Alvarez", "frequency":3},
        //     { "lgu": "General Trias", "frequency":156},
        //     { "lgu": "Imus", "frequency":62},
        //     { "lgu": "Indang", "frequency":10},
        //     { "lgu": "Kawit", "frequency":51},
        //     { "lgu": "Magallanes", "frequency":19},
        //     { "lgu": "Maragondon", "frequency":149},
        //     { "lgu": "Naic", "frequency":235},
        //     { "lgu": "Noveleta", "frequency":5},
        //     { "lgu": "Rosario", "frequency":44},
        //     { "lgu": "Silang", "frequency":85},
        //     { "lgu": "Tagaytay", "frequency":4},
        //     { "lgu": "Tanza", "frequency":164},
        //     { "lgu": "Ternate", "frequency":11},
        //     { "lgu": "Trece Martires", "frequency":96}
            
        //     ]

// Separate features (frequency, temperature, humidity) and target variable (riskLevel)
const X = historicalData.map(entry => [entry.frequency, entry.temperature, entry.humidity]);
const y = historicalData.map(entry => entry.riskLevel);

// Train a decision tree classifier
const { DecisionTreeClassifier } = ml.tree;
const classifier = new DecisionTreeClassifier();
classifier.train(X, y);

// Predict risk level for new coordinates
const newCoordinates = { latitude: 123.343, longitude: 14.34364 }; // Example new coordinates
// Extract features for the new coordinates (you need to define this)
const newFeatures = [/* Extract features from new coordinates */];
const newPrediction = classifier.predict(newFeatures);
console.log('Predicted risk level for new coordinates:', newPrediction);
