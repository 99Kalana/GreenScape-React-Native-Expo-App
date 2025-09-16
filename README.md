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

npm install
# or
yarn install

