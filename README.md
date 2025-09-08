XRPL Wallet Explorer
A mobile application built with React Native and Expo for exploring XRP Ledger wallets. Track balances, view recent transactions, and monitor the live XRP price.
Features

Search Wallets: Look up any XRP public address to view its details.
Live Data: Displays the current XRP balance and its equivalent USD value.
Transaction History: Shows a list of recent transactions associated with the wallet.
Environment Variables: Securely manages the API URL using app.config.js.

Getting Started
Follow these instructions to get a copy of the project up and running on your local machine.
Prerequisites

Node.js installed (version 16 or higher recommended).
Expo CLI installed globally: npm install -g expo-cli.
Access to the backend API for fetching wallet data.

Installation

Clone the repository:
git clone https://github.com/gassafrica/xrpl_wallet_explore_front.git
cd xrpl_wallet_explore_front


Install the dependencies:
npm install



Configuration
This project requires a backend API to fetch wallet data. The API URL is managed through app.config.js to keep sensitive information out of the main codebase.

Open the app.config.js file in the root of your project.

Update the apiUrl in the extra field to match the local IP address and port of your running backend server:
// app.config.js
export default ({ config }) => {
  return {
    ...config,
    extra: {
      // Change this to your local machine's IP address
      apiUrl: 'http://<your_local_ip_address>:8000/api',
    },
  };
};



Running the App

Start the Expo development server:
npx expo start


This will open a new tab in your browser with the Expo DevTools.

Run the app on:

An emulator (e.g., Android Studio or Xcode).
A physical device by scanning the QR code with the Expo Go app.
A web browser (if supported).



Project Structure

app.config.js: Manages environment variables for the API URL.
Home.js: The main component containing the UI and logic for the wallet explorer.
package.json: Manages project dependencies and scripts.

Contributing
We welcome contributions! To contribute:

Fork the repository.
Create a new branch for your feature or bug fix: git checkout -b feature/your-feature-name.
Make your changes and commit them: git commit -m "Add your message here".
Push to your branch: git push origin feature/your-feature-name.
Submit a pull request with a detailed description of your changes.

License
This project is licensed under the MIT License - see the LICENSE file for details.
Acknowledgments

Built with React Native and Expo.
Thanks to the XRP Ledger community for providing robust APIs and documentation.
