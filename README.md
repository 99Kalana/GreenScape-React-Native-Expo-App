GreenScape: Your Personal Plant Care Companion 🪴
GreenScape is a cross-platform mobile application designed for single-user plant enthusiasts to manage their personal plant collection. This app serves as a digital plant tracker, providing a centralized place to add, view, update, and delete plant records. It also helps users remember key care tasks by setting reminders for watering and fertilizing.

This project was developed as the final coursework for the ITS 2127 - Advanced Mobile Developer module. It demonstrates core mobile development competencies, including:


Data Persistence & Authentication: User and plant data are securely stored in a Firebase database, accessible only after successful user authentication.



Core Functionality (CRUD): The application implements full Create, Read, Update, and Delete operations for the Plant data model.


API Integration: The app integrates with a third-party plant identification API (e.g., PlantNet) to allow users to identify plants from a photo.


Navigation: The app includes a responsive navigation system to move between screens.


State Management: Global state management is handled to ensure a smooth user experience.

Key Features

User Authentication: Secure signup and login functionality using Firebase Auth.


Plant Management: Add, view, edit, and delete entries for each plant in your collection.

Watering & Fertilizing Reminders: Set and manage care reminders for your plants.

Plant Identification: Use the camera to take a photo of a plant and get instant identification via an external API.


Responsive UI: A clean, intuitive, and user-friendly interface designed for a seamless mobile experience.

Tech Stack
Frontend: React Native with Expo

Styling: Tailwind CSS

Backend: Firebase (Authentication and Firestore for database)

APIs: A third-party plant identification API (e.g., PlantNet)

Installation & Setup
Follow these instructions to get the project up and running on your local machine.

Prerequisites
Ensure you have the following installed:

Node.js (LTS version)

npm or Yarn

Expo CLI

Step 1: Clone the repository
Bash

git clone <Your_GitHub_Repository_Link>
cd GreenScape
Step 2: Install dependencies
Bash

npm install
# or
yarn install
Step 3: Configure Firebase
Create a new Firebase project in the Firebase Console.

Set up Firebase Authentication and Firestore.

Add a new web app to your Firebase project and copy the firebaseConfig object.

In your project, create a .env file and populate it with your Firebase configuration variables, following the format in firebase.ts and using Expo Public variables:

Code snippet

EXPO_PUBLIC_FIREBASE_API_KEY="your-api-key"
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN="your-auth-domain"
EXPO_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
EXPO_PUBLIC_FIREBASE_APP_ID="your-app-id"
Step 4: Run the application
Start the development server:

Bash

npx expo start
You can now scan the QR code with the Expo Go app on your mobile device to view the application.