import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js'
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword }
    from 'https://www.gstatic.com/firebasejs/9.14.0/firebase-auth.js';
import {
    getDatabase,
    ref as firebaseDbRef,
    set as firebaseSet,
    onValue
} from 'https://www.gstatic.com/firebasejs/9.14.0/firebase-database.js'

const firebaseConfig = {
    apiKey: "AIzaSyBHotbN4NFdHsBgkjCirxv9aRchmBc8i8k",
    authDomain: "chatkavano.firebaseapp.com",
    databaseURL: "https://chatkavano-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "chatkavano",
    storageBucket: "chatkavano.appspot.com",
    messagingSenderId: "2046591712",
    appId: "1:2046591712:web:f61a9e941749f371a54685",
    measurementId: "G-3HEJ3R1C3C"
};

const app = initializeApp(firebaseConfig);
const firebaseDb = getDatabase()
const auth = getAuth();

// let user = JSON.parse(localStorage.getItem('user'));

// if (user && (!auth.currentUser)) {
//     login();
// } else if (!user && (auth.currentUser)) {
//     auth.signOut();
// }

// function login() {
//     console.log(user);
//     signInWithEmailAndPassword(auth, user.email, user.password)
//         .then((user) => {
//             // console.log(user);
//         })
//         .catch((err) => {
//             console.log(err.message);
//         })

//     onAuthStateChanged(auth, (user) => {
//         if (user) {
//             //sign in
//             const userId = user.uid;
//             firebaseSet(firebaseDbRef(
//                 firebaseDb,
//                 `users/${userId}`
//             ), {
//                 email: user.email,
//                 emailVerified: user.emailVerified,
//                 accessToken: user.accessToken
//             })
//         }
//     })
// }

export {
    app,
    firebaseDb,
    firebaseDbRef,
    firebaseSet,
    auth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    onValue
}