import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyA53LkL3bmpJvTkF120f_ij9YrDQNd7rVU',
    authDomain: 'svelte-todo-b5cf4.firebaseapp.com',
    projectId: 'svelte-todo-b5cf4',
    storageBucket: 'svelte-todo-b5cf4.appspot.com',
    messagingSenderId: '1065709554609',
    appId: '1:1065709554609:web:437116465e13d73b16cb90',
    measurementId: 'G-36KCEXY066'
};

firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const googleProvider = new firebase.auth.GoogleAuthProvider();
export const db = firebase.firestore();

firebase.auth().onAuthStateChanged(function(user) {
    console.log('auth state changed');
    if (user) {
        db.collection('users').doc(user.uid).get().then((docSnapshot) => {
            if (!docSnapshot.exists) {
                console.log(user.uid);
                db.collection('users').doc(user.uid).set({ });
            }
        });
    }
});