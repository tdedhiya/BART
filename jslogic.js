    /*Answer to same origin policy
    Because of  Cross-Origin Resource Sharing we are able to access data from api which originates from different origin.
    in my server code i have used cors to allow requests from other cross origin*/
    if (!localStorage.getItem("count")) {
        localStorage.setItem("count", 1);
    } 
    else{
        localStorage.setItem("count", Number(localStorage.getItem("count"))+ 1);
    }
    var stations;

        function getStations(){
            window.onclick = function(event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                }
            }
            var text = document.getElementById("modalText");
            text.innerHTML = "Welcome to the website for "+localStorage.getItem("count")+" time";
            var span = document.getElementsByClassName("close")[0];
            span.onclick = function() {
                modal.style.display = "none";
            }
            var modal = document.getElementById('myModal');
            modal.style.display = "block";

            $.get("https://frozen-depths-89126.herokuapp.com/stations", function(data, status){
               stations = data.body.root.stations.station;
               addStationsToList("source",stations)
               addStationsToList("destination",stations) 
            });
        }

        

        function addStationsToList(id,stationsList){
            var sourceList = document.getElementById(id);
            sourceList.options.length = 0;
            var station = new Option("none", "none");
                  sourceList.options.add(station);
            for (i = 0; i < stationsList.length; i++) {
               var station = new Option(stationsList[i].name, stationsList[i].abbr);
                  sourceList.options.add(station);
            }
        }

        function ChangeList(object){
            var listSelected = object.id;
            var listToChange = "source";
            if(listSelected === listToChange){
                listToChange = "destination"
                document.getElementById("destination").disabled = false;
            }
            var temp = stations.filter(function(el) {
                return el.abbr !== object.value;
            });
            addStationsToList(listToChange,temp)
        }

        function getTrains(){
            var source = $("#source").val();;
            var destination = $("#destination").val();
            console.log(destination)
            if(source === destination){
                document.getElementById('errfn').innerHTML="Departure and Arrival stations cannot be same";
            }else if(destination == "none"){
                document.getElementById('errfn').innerHTML="Arrival station cannot be none";
            }
            else{
                $.get("https://frozen-depths-89126.herokuapp.com/trips?source="+source+"&destination="+destination, function(data, status){
                        showTrains(data.body,source);
                     });

                     //calling trip api every 30 seconds to get real time trips updated data
                setInterval(function() {
                    $.get("https://frozen-depths-89126.herokuapp.com/trips?source="+source+"&destination="+destination, function(data, status){
                        showTrains(data.body,source);
                     });
                }, 30000);
            }
            getStationInfo(source);
        }

        function showTrains(data){
            console.log("here");
            $("#tablediv").html("");
            var body= document.getElementById('tablediv');
            
            var data = data.root.schedule.request.trip;
            
            var tbl=document.createElement('table');
            tbl.style.width='100%';
            tbl.setAttribute('border','1');

            var tbdy=document.createElement('tbody');

            var tr=document.createElement('tr');
            var headers = ['Departure Time','Arrival Time','Fare By Clipper Card','Fare By Cash','Fare for Senior/Disabled','Fare for Student']
            
            for(var i = 0; i < headers.length;i++){
                var td=document.createElement('th');
                td.appendChild(document.createTextNode(headers[i]))
                tr.appendChild(td)
            }
            tbdy.appendChild(tr);
            for(var i=0;i<data.length;i++){
                var tr=document.createElement('tr');
                
                    var td=document.createElement('td');
                    td.appendChild(document.createTextNode(data[i]["@origTimeMin"]));
                    tr.appendChild(td)

                    var td=document.createElement('td');
                    td.appendChild(document.createTextNode(data[i]["@destTimeMin"]))
                    tr.appendChild(td)

                    var td=document.createElement('td');
                    td.appendChild(document.createTextNode("$" + data[i].fares.fare["0"]["@amount"]))
                    tr.appendChild(td)

                    var td=document.createElement('td');
                    td.appendChild(document.createTextNode("$" + data[i].fares.fare["1"]["@amount"]))
                    tr.appendChild(td)

                    var td=document.createElement('td');
                    td.appendChild(document.createTextNode("$" + data[i].fares.fare["2"]["@amount"]))
                    tr.appendChild(td)

                    var td=document.createElement('td');
                    td.appendChild(document.createTextNode("$" + data[i].fares.fare["3"]["@amount"]))
                    tr.appendChild(td)
                
                tbdy.appendChild(tr);
            }
            tbl.appendChild(tbdy);
            body.appendChild(tbl);
           
            var date = new Date.parse(data[0]["@origTimeMin"]);
            $("#getting-started").html("");
             $("#getting-started").countdown(date, function(event) {
                $(this).text(
                event.strftime('%H:%M:%S remaining for the first train to depart')
                );
            });
        }

        function getStationInfo(source){
            $.get("https://frozen-depths-89126.herokuapp.com/station/"+source, function(data, status){
                   document.getElementById("info").innerHTML = data.body.root.stations.station.intro["#cdata-section"] + " " + data.body.root.stations.station.food["#cdata-section"]
                   + " " + data.body.root.stations.station.attraction["#cdata-section"];
                });
        }

        function initMap() {
            var directionsService = new google.maps.DirectionsService;
            var directionsDisplay = new google.maps.DirectionsRenderer;
            var map = new google.maps.Map(document.getElementById('map'), {
                zoom: 7,
                center: {lat: 37.7749, lng: -122.4194}
            });
            directionsDisplay.setMap(map);
            var onChangeHandler = function() {
                showRouteOnMap(directionsService, directionsDisplay); 
            };
            document.getElementById('submit').addEventListener('click', onChangeHandler);
        }

        function showRouteOnMap(directionsService,directionsDisplay){
            var source = $("#source").val();;
            var destination = $("#destination").val();
            var sourceLat = {}
            var destinationLat = {}
           for(var i = 0; i < stations.length;i++){
               if(stations[i].abbr === source){
                   sourceLat.lat = parseFloat(stations[i].gtfs_latitude)
                   sourceLat.lng = parseFloat(stations[i].gtfs_longitude)                   
               }else if(stations[i].abbr === destination){
                destinationLat.lat = parseFloat(stations[i].gtfs_latitude)
                destinationLat.lng = parseFloat(stations[i].gtfs_longitude)  
               }
           } 
           directionsService.route({
                origin: new google.maps.LatLng(sourceLat.lat,  sourceLat.lng),
                destination: new google.maps.LatLng(destinationLat.lat, destinationLat.lng),
                travelMode: 'TRANSIT'
            }, function(response, status) {
                if (status === 'OK') {
                directionsDisplay.setDirections(response);
                } else {
                    console.log("mapStatus: " + status)
                }
            });
        }