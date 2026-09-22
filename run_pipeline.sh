#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "============================================================"
echo "    Starting Indian Law NLP Pipeline Automation"
echo "============================================================"

# Step 1: Generate specialized Indian Law dataset
echo "[1/3] Running Data Extraction & Generation..."
python3 data_builder.py

# Step 2: Train the Classifier Model
echo "[2/3] Training Legal Clause Classifier..."
python3 train.py

# Step 3: Evaluate Metrics & Plot Results
echo "[3/3] Generating Evaluation Metrics & Plots..."
python3 evaluate_and_plot.py

echo "============================================================"
echo "    Pipeline Completed Successfully!"
echo "============================================================"
