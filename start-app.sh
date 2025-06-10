#!/bin/bash

# Navigate to the project root directory
cd /Users/briandodur/Documents/MY-JOBS/react-native-job-search-app

# Navigate to the our-jobs directory
cd our-jobs

# Install dependencies and update packages
echo "Installing dependencies..."
npm install

# Update @react-native-picker/picker to the correct version
echo "Updating @react-native-picker/picker to version 2.9.0..."
npm install @react-native-picker/picker@2.9.0

# Start the app
echo "Starting the app..."
npm start 