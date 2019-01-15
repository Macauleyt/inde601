function burgerMenu() {
  var x = document.getElementById("myLinks");
  var y = document.getElementById("sidenav");

  if (x.style.display === "block") {
    x.style.display = "none";
    y.style.height = "40px";
    y.style.width = "45px";
    // y.style.backgroundColor = "rgba(37, 71, 75, 0.8)";
    y.style.borderRadius = "20px";
    y.style.boxShadow = " 1px 1px 7px rgb(0, 0, 0, 0.8)";
  } else {
    x.style.display = "block";
    y.style.height = "200px";
    y.style.width = "140px";
    // y.style.backgroundColor = "rgba(37, 71, 75,0.8)";
    y.style.borderRadius = "0px";
    y.style.boxShadow = " 2px 3px 15px rgb(0, 0, 0, 0.8)";
  }
}
$(document).ready(function() {
  $(".info-btn").click(function() {
    $("#info-box").toggle();
  });
});

const currentTime = () => {
  var day = new Date();

  var fullYear = day.getFullYear();
  var year = fullYear.toString().substr(-2);

  var date = day.getDate() + "/" + (day.getMonth() + 1) + "/" + year;

  var hours = day.getHours();
  var minutes = day.getMinutes();
  minutes = checkTime(minutes);

  var time = hours + ":" + minutes;

  // console.log(date + " " + time);

  var timeDiv = document.getElementById("current-time");

  timeDiv.innerHTML = time + " " + date;
};

function checkTime(i) {
  if (i < 10) {
    i = "0" + i;
  } // add zero in front of numbers < 10
  return i;
}

setInterval(currentTime, 1000);
