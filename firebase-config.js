// Firebase 配置資訊 - 伊芙請在此處貼上您的 Firebase 金鑰
// 1. 前往 Firebase 控制台 (https://console.firebase.google.com/)
// 2. 點擊「專案設定 (Project Settings)」->「常規 (General)」
// 3. 捲動到最下方的「您的應用程式 (Your apps)」，選擇或新增網頁應用
// 4. 在「SDK 設定和配置」選擇「配置 (Config)」，複製內容貼到下方

const firebaseConfig = {
    apiKey: "在此貼上 AIzaSy 開頭的字串",
    authDomain: "在此貼上 your-project.firebaseapp.com",
    databaseURL: "在此貼上 https://your-project-default-rtdb.firebaseio.com",
    projectId: "在此貼上 your-project-id",
    storageBucket: "在此貼上 your-project.appspot.com",
    messagingSenderId: "在此貼上 數字 ID",
    appId: "在此貼上 1:數字:web:字串"
};

// 初始化 Firebase
if (firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('在此貼上')) {
    firebase.initializeApp(firebaseConfig);
    window.db = firebase.database();
} else {
    console.warn("Firebase 未設定，切換為本地模擬模式。");
    window.db = {
        ref: () => ({
            on: (type, callback) => callback({ val: () => null }),
            set: () => console.log("離線狀態：無法存檔")
        })
    };
}
