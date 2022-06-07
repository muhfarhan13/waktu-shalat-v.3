window.onload = function () {
  getCity();
  clock();
};

let date = new Date();
let getMonth = ("0" + (date.getMonth() + 1)).slice(-2);
let getDay = ("0" + date.getDate()).slice(-2);

let year = new Date().getFullYear();
let month = new Date().getMonth();
let day = new Date().getDate();

let currentPray = "";
let jadwalSholat = [];

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function clock() {
  let time = new Date();
  let hour = set(time.getHours());
  let menit = set(time.getMinutes());

  document.getElementById("clock").innerHTML = `${hour}:${menit}`;
  setTimeout("clock()", 1000);
}

function set(clock) {
  clock = clock < 10 ? "0" + clock : clock;
  return clock;
}

function getCity() {
  axios
    .get("https://api.banghasan.com/sholat/format/json/kota")
    .then((response) => {
      let selection = document.getElementById("selection");
      for (let city of response.data.kota) {
        let option = document.createElement("option");
        option.setAttribute("value", city.id);
        option.text = city.nama;
        selection.appendChild(option);
      }
      $(document).ready(function () {
        $("#selection").select2();
      });
    })
    .catch((error) => {
      Swal.fire({
        icon: "error",
        title: "Ada yang salah!",
        text: error,
      });
    });
}

function selectCity() {
  const kota = document.getElementById("selection");
  const idKota = kota.options[kota.selectedIndex].value;

  axios
    .get(
      `https://api.banghasan.com/sholat/format/json/jadwal/kota/${idKota}/tanggal/${year}-${getMonth}-${getDay}`
    )
    .then((response) => {
      let apiJam = response.data.jadwal.data;
      let jamSholat = {
        Subuh: apiJam.subuh,
        Dzuhur: apiJam.dzuhur,
        Ashar: apiJam.ashar,
        Maghrib: apiJam.maghrib,
        Isya: apiJam.isya,
      };

      for (let waktuSholat in jamSholat) {
        const countDate = new Date(
          `${monthNames[month]} ${day}, ${year} ${jamSholat[waktuSholat]}`
        ).getTime();

        jadwalSholat[waktuSholat] = countDate;
      }

      currentPray = checkPrayTime(jadwalSholat);

      document
        .getElementById("countSubuh")
        .setAttribute(
          "data-date",
          `${monthNames[month]} ${day}, ${year} ${jamSholat["Subuh"]}`
        );
      document
        .getElementById("countDzuhur")
        .setAttribute(
          "data-date",
          `${monthNames[month]} ${day}, ${year} ${jamSholat["Dzuhur"]}`
        );
      document
        .getElementById("countAshar")
        .setAttribute(
          "data-date",
          `${monthNames[month]} ${day}, ${year} ${jamSholat["Ashar"]}`
        );
      document
        .getElementById("countMaghrib")
        .setAttribute(
          "data-date",
          `${monthNames[month]} ${day}, ${year} ${jamSholat["Maghrib"]}`
        );
      document
        .getElementById("countIsya")
        .setAttribute(
          "data-date",
          `${monthNames[month]} ${day}, ${year} ${jamSholat["Isya"]}`
        );

      document.getElementById("subuh").innerHTML = jamSholat["Subuh"];
      document.getElementById("dzuhur").innerHTML = jamSholat["Dzuhur"];
      document.getElementById("ashar").innerHTML = jamSholat["Ashar"];
      document.getElementById("maghrib").innerHTML = jamSholat["Maghrib"];
      document.getElementById("isya").innerHTML = jamSholat["Isya"];

      setInterval(function () {
        setRemaining(currentPray);
        allCount();
      }, 1000);
    })

    .catch((error) => {
      Swal.fire({
        icon: "error",
        title: "Ada yang salah!",
        text: error,
      });
    });
}

function setRemaining(shalat) {
  let distance = jadwalSholat[shalat] - Date.now();

  if (distance > 0) {
    let hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById(
      "nextTime"
    ).innerHTML = `${hours} hours ${minutes} minutes ${seconds} seconds`;

    document.getElementById(
      "remainingText"
    ).innerHTML = `Remaining for Adzan ${currentPray}`;
  } else if (Date.now() > jadwalSholat["Isya"]) {
    document.getElementById("nextTime").innerHTML =
      "WAKTU HARI INI TELAH HABIS!";
  } else {
    let audio = document.querySelector("audio");
    audio.play();

    currentPray = checkPrayTime(jadwalSholat);
  }
}

function checkPrayTime(jadwalSholat) {
  for (let waktuSholat in jadwalSholat) {
    if (Date.now() < jadwalSholat[waktuSholat]) {
      return waktuSholat;
    }
  }
}

function allCount() {
  let countClass = document.getElementsByClassName("count-class");
  let countDownDate = new Array();
  for (let i = 0; i < countClass.length; i++) {
    countDownDate[i] = new Array();
    countDownDate[i]["el"] = countClass[i];
    countDownDate[i]["time"] = new Date(
      countClass[i].getAttribute("data-date")
    ).getTime();
  }

  for (let i = 0; i < countDownDate.length; i++) {
    let now = new Date().getTime();
    let distance = countDownDate[i]["time"] - now;
    countDownDate[i]["hours"] = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    countDownDate[i]["minutes"] = Math.floor(
      (distance % (1000 * 60 * 60)) / (1000 * 60)
    );

    if (distance < 0) {
      countDownDate[i]["el"].querySelector(".hours").innerHTML = "0 hours";
      countDownDate[i]["el"].querySelector(".minutes").innerHTML = "0 minutes";
    } else {
      countDownDate[i]["el"].querySelector(".hours").innerHTML =
        countDownDate[i]["hours"] + " hours";
      countDownDate[i]["el"].querySelector(".minutes").innerHTML =
        countDownDate[i]["minutes"] + " minutes";
    }
  }
}

const openBotSheet = document.getElementById("openBotSheet");
const closeBotSheet = document.getElementById("closeBotSheet");
const bottomSheet = document.getElementById("divBottom");

openBotSheet.addEventListener("click", function () {
  bottomSheet.style.bottom = 0;
});

closeBotSheet.addEventListener("click", function () {
  bottomSheet.style.bottom = "-800px";
});
