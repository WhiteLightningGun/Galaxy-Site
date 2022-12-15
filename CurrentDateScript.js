function updateTime()
{
    var today = new Date();
    var day = today.getDay();
    var daylist = ["Sunday","Monday","Tuesday","Wednesday ","Thursday","Friday","Saturday"];
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var minutes = today.getMinutes()

    if (String(minutes).length == 1)
    {
       minutes = '0' + minutes
    }

    var seconds = today.getSeconds();

    if (String(seconds).length == 1)
    {
       seconds = '0' + seconds
    }

    var time = today.getHours() + ":" + minutes + ":" + seconds;
    var dateTime = date+' '+time;
    document.getElementById("dateTime1").innerHTML = dateTime + ' <br>' + daylist[day];
}

updateTime();

setInterval(updateTime, 1000);