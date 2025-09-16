# GreenScape: Your Personal Plant Care Companion 🪴

GreenScape is a cross-platform mobile application designed for single-user plant enthusiasts to manage their personal plant collection.  
This app serves as a digital plant tracker, providing a centralized place to **add, view, update, and delete** plant records.  
It also helps users remember key care tasks by setting reminders for watering and fertilizing.

This project was developed as the final coursework for the **ITS 2127 - Advanced Mobile Developer** module.  
It demonstrates core mobile development competencies, including:

- **Data Persistence & Authentication**: User and plant data are securely stored in a Firebase database, accessible only after successful user authentication.
- **Core Functionality (CRUD)**: Implements full **Create, Read, Update, Delete** operations for plant data.
- **API Integration**: Integrates with a third-party plant identification API (e.g., PlantNet) to identify plants from photos.
- **Navigation**: A responsive navigation system for smooth screen transitions.
- **State Management**: Global state management ensures a seamless user experience.

---

## 🌟 Key Features

- 🔐 **User Authentication**: Secure signup and login with Firebase Auth.  
- 🌱 **Plant Management**: Add, view, edit, and delete plants in your collection.  
- ⏰ **Reminders**: Set watering & fertilizing reminders for your plants.  
- 📸 **Plant Identification**: Identify plants instantly using the camera and an external API.  
- 📱 **Responsive UI**: Clean, intuitive, and user-friendly design for a smooth mobile experience.  

---

## 🛠 Tech Stack

- **Frontend**: React Native (Expo)  
- **Styling**: Tailwind CSS  
- **Backend**: Firebase (Authentication & Firestore)  
- **APIs**: Third-party plant identification API (e.g., PlantNet)  

---

## 🚀 Installation & Setup

Follow these steps to get the project running locally:

### ✅ Prerequisites
Make sure you have installed:

- [Node.js (LTS)](https://nodejs.org/)  
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)  
- [Expo CLI](https://docs.expo.dev/get-started/installation/)  

---

### 1. Clone the Repository

```bash
git clone <Your_GitHub_Repository_Link>
cd GreenScape

---

### 2. Install Dependencies

Run the following command to install the required dependencies:

```bash
npm install
# or
yarn install

---

### 3. Configure Firebase

- Create a new project in the [Firebase Console](https://console.firebase.google.com/).
- Set up **Authentication** and **Firestore Database**.
- Add a new Web App and copy the `firebaseConfig` object.
- In your project root, create a `.env` file and add the following variables:

```env
EXPO_PUBLIC_FIREBASE_API_KEY="your-api-key"
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN="your-auth-domain"
EXPO_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
EXPO_PUBLIC_FIREBASE_APP_ID="your-app-id"

---

### 4. Run the Application

Start the development server by running:

```bash
npx expo start