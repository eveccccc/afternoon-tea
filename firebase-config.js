// Firebase 配置資訊 - 伊芙請在此處貼上您的 Firebase 金鑰
// 1. 前往 Firebase 控制台 (https://console.firebase.google.com/)
// 2. 點擊「專案設定 (Project Settings)」->「常規 (General)」
// 3. 捲動到最下方的「您的應用程式 (Your apps)」，選擇或新增網頁應用
// 4. 在「SDK 設定和配置」選擇「配置 (Config)」，複製內容貼到下方

const firebaseConfig = {
    apiKey: "AIzaSyB0Kz9HupK0hUppXyi0q0jxbwuxUpUuzfc",
    authDomain: "teatime-a0138.firebaseapp.com",
    databaseURL: "https://teatime-a0138-default-rtdb.firebaseio.com",
    projectId: "teatime-a0138",
    storageBucket: "teatime-a0138.firebasestorage.app",
    messagingSenderId: "560683203956",
    appId: "1:560683203956:web:3782e8dfbb503099a40021",
    measurementId: "G-PBP8BE275S"
};

// 初始化 Firebase
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "") {
    firebase.initializeApp(firebaseConfig);
    window.db = firebase.database();
    console.log("Firebase 雲端連線成功！");
} else {
    console.warn("Firebase apiKey 尚未正確設定，切換為本地模式。");
    window.db = {
        ref: () => ({
            on: (type, callback) => callback({ val: () => null }),
            set: () => console.log("離線狀態：暫不存檔")
        })
    };
}
