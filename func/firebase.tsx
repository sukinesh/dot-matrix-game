import { initializeApp } from "firebase/app";

const firebaseConfig = {                                 
    apiKey: "AIzaSyA476S6cm6tpnEEQJLL6L9jLLz4afotATI",
    authDomain: "apis-and-miscs.firebaseapp.com",
    projectId: "apis-and-miscs",
    storageBucket: "apis-and-miscs.appspot.com",
    messagingSenderId: "471743871347",
    databaseURL: "https://dotgames.firebaseio.com/",
    appId: "1:471743871347:web:d85fbd1ecac94496d76d06"
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);

import { getDatabase} from "firebase/database";
// export const firestore = getFirestore(firebase, "dotgames");

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(firebase);
