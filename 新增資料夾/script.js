let data = [];
let currentCategory = "全部";

// 初始化：從 LocalStorage 讀取資料
window.onload = function() {
    let saved = localStorage.getItem("mistakes");
    if(saved) data = JSON.parse(saved);
    renderTabs();
    show();
};

// 儲存至 LocalStorage
function save() {
    localStorage.setItem("mistakes", JSON.stringify(data));
}

// 預覽圖片
function previewImage(input) {
    const preview = document.getElementById("imagePreview");
    preview.innerHTML = ""; 
    if (input.files && input.files[0]) {
        let reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}">`;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// 新增錯題
function addItem() {
    let q = document.getElementById("question").value;
    let c = document.getElementById("category").value;
    let fileInput = document.getElementById("imageInput");
    let file = fileInput.files[0];

    if(!q && !file) {
        alert("請輸入內容或拍張照片！");
        return;
    }

    const processData = (imgData) => {
        data.push({
            text: q,
            category: c,
            image: imgData,
            date: new Date().toLocaleDateString()
        });
        save();
        renderTabs();
        show();
        // 重設輸入區
        document.getElementById("question").value = "";
        fileInput.value = "";
        document.getElementById("imagePreview").innerHTML = "";
    };

    if(file) {
        let reader = new FileReader();
        reader.onload = (e) => processData(e.target.result);
        reader.readAsDataURL(file);
    } else {
        processData(null);
    }
}

// 渲染分類頁籤
function renderTabs() {
    let tabs = document.getElementById("tabs");
    let categories = ["全部", ...new Set(data.map(i => i.category))];
    tabs.innerHTML = categories.map(c => 
        `<button onclick="switchTab('${c}')" style="${currentCategory === c ? 'background:#444':'' }">${c}</button>`
    ).join("");
}

function switchTab(c) {
    currentCategory = c;
    show();
    renderTabs();
}

// 顯示列表
function show() {
    let list = document.getElementById("list");
    let keyword = document.getElementById("search").value.toLowerCase();
    list.innerHTML = "";

    data.filter(item => 
        (currentCategory === "全部" || item.category === currentCategory) &&
        (item.text?.toLowerCase().includes(keyword))
    ).forEach((item, i) => {
        list.innerHTML += `
            <div class="item">
                <small>${item.date || ""} 分類：${item.category}</small>
                ${item.text ? `<p>${item.text}</p>` : ""}
                ${item.image ? `<img src="${item.image}">` : ""}
                <button onclick="del(${i})" style="background:#ff4d4d; margin-top:10px;">刪除</button>
            </div>
        `;
    });
}

function del(i) {
    if(confirm("確定要刪除這題嗎？")) {
        data.splice(i,1);
        save();
        show();
    }
}

// 匯出與匯入
function exportData() {
    let blob = new Blob([JSON.stringify(data)], {type:"application/json"});
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `mistakes_backup_${new Date().getTime()}.json`;
    a.click();
}

function importData(e) {
    let file = e.target.files[0];
    let reader = new FileReader();
    reader.onload = function() {
        data = JSON.parse(reader.result);
        save();
        renderTabs();
        show();
    };
    reader.readAsText(file);
}