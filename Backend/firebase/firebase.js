import { initializeApp } from 'firebase/app';
import {
    getAuth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification
} from 'firebase/auth';
import {
    getDatabase,
    ref as firebaseDbRef,
    set as firebaseSet,
    update as firebaseUpdate,
    get,
    child,
    onValue,
    remove as firebaseRemove
} from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyBHotbN4NFdHsBgkjCirxv9aRchmBc8i8k",
    authDomain: "chatkavano.firebaseapp.com",
    databaseURL: "https://chatkavano-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "chatkavano",
    appId: '1:2046591712:android:e5e0a8c3ef86e6a7a54685',
    storageBucket: "chatkavano.appspot.com",
    messagingSenderId: "2046591712",
}
const app = initializeApp(firebaseConfig)
const auth = getAuth()
const firebaseDb = getDatabase()

export {
    auth,
    firebaseDb,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    onAuthStateChanged,
    firebaseDbRef,
    firebaseSet,
    signInWithEmailAndPassword,
    get,
    child,
    onValue,
    firebaseRemove,
    firebaseUpdate
}