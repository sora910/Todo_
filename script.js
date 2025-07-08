document.addEventListener("DOMContentLoaded", () => {
  
  if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(() => console.log('Service Worker registered'))
    .catch(err => console.error('SW registration failed:', err));
}

  const addTaskButton = document.getElementById("addTaskButton");
  const taskInput = document.getElementById("taskInput");
  const taskList = document.getElementById("taskList");

  const tasks = []; // ✅ タスク一覧をグローバルに定義（1回だけ）

  // 地図の初期化（東京駅中心）
  const map = L.map('map').setView([35.681236, 139.767125], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // 現在地を取得して表示
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const userLocation = [lat, lng];

        map.setView(userLocation, 15);
        L.marker(userLocation).addTo(map)
          .bindPopup("現在地")
          .openPopup();
      },
      (error) => {
        console.error("位置情報の取得に失敗しました", error);
      }
    );
  } else {
    alert("このブラウザでは位置情報がサポートされていません。");
  }

  // 通知の許可
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }

  let selectedLatLng = null;
  window.currentMarker = null;

  // 地図クリックで位置を選択
  map.on('click', function(e) {
    selectedLatLng = e.latlng;

    if (window.currentMarker) {
      map.removeLayer(window.currentMarker);
    }
    window.currentMarker = L.marker(selectedLatLng).addTo(map);
  });

  // ✅ タスク追加処理
  addTaskButton.addEventListener("click", () => {
    const taskText = taskInput.value.trim();
    if (taskText === "" || !selectedLatLng) return;

    const listItem = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";

    const label = document.createElement("label");
    label.appendChild(document.createTextNode(taskText + " "));

    const mapLink = document.createElement("a");
    mapLink.href = `https://www.google.com/maps?q=${selectedLatLng.lat},${selectedLatLng.lng}`;
    mapLink.target = "_blank";
    mapLink.textContent = "📍 地図で開く";
    mapLink.style.marginLeft = "8px";
    label.appendChild(mapLink);

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "削除";

    checkbox.addEventListener("change", () => {
      label.style.textDecoration = checkbox.checked ? "line-through" : "none";
    });

    deleteButton.addEventListener("click", () => {
      taskList.removeChild(listItem);
      map.removeLayer(taskMarker);
    });

    listItem.appendChild(checkbox);
    listItem.appendChild(label);
    listItem.appendChild(deleteButton);
    taskList.appendChild(listItem);

    const taskMarker = L.marker(selectedLatLng).addTo(map).bindPopup(taskText);

    // ✅ タスクを保存（selectedLatLngはこの時点で有効）
    tasks.push({
      text: taskText,
      lat: selectedLatLng.lat,
      lng: selectedLatLng.lng,
      notified: false
    });

    // 入力リセット
    taskInput.value = "";
    selectedLatLng = null;
    if (window.currentMarker) {
      map.removeLayer(window.currentMarker);
      window.currentMarker = null;
    }
  });

  // ✅ 一度だけ現在地を監視して通知処理
  navigator.geolocation.watchPosition((position) => {
    const userLat = position.coords.latitude;
    const userLng = position.coords.longitude;

    tasks.forEach(task => {
      if (task.notified) return;

      const distance = getDistance(userLat, userLng, task.lat, task.lng);
      console.log(`距離: ${distance.toFixed(1)}m → タスク: ${task.text}`);

      if (distance <= 100) {
        new Notification(`近くでやること: ${task.text}`);
        task.notified = true;
      }
    });
  }, (err) => {
    console.error("位置情報取得に失敗", err);
  }, {
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 5000
  });

  // 距離計算関数
  function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad;
    const dLon = (lon2 - lon1) * rad;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
              Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
});
