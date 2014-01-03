/*
 * RSSI Distribution Visualization Tool
 * Author: Aravinth, S. Panchadcharam
 * Date: 20 November 2013
 * Email: panch.aravinth@gmail.com
 * */


/*
 * DOM Ready
 * */
$(function () {
    view.initiateUI();

    app.eventBus.subscribe("server:selected", function (data) {
        controller.serverSelected(data)
    });

    app.eventBus.subscribe("databaseList:retrieved", function (data) {
        app.databaseList = data
        view.updateDatabaseListUi(data)
    });

    app.eventBus.subscribe("database:selected", function (data) {
        collection.getCollectionList(data)
    });

    app.eventBus.subscribe("collectionList:retrieved", function (data) {
        app.collectionList = data
        view.updateCollectionListUi(data)
    });

    app.eventBus.subscribe("collection:selected", function (data) {
        view.showLoader()
        collection.getSelectedCollection(data)
    });

    app.eventBus.subscribe("selectedCollection:retrieved", function (data) {
        app.selectedCollection = data
        collection.getRawData(data)
    });

    app.eventBus.subscribe("rawData:retrieved", function () {
        view.hideLoader()
        loadLocations(app.rawData)
    });

});


var controller = {
    serverSelected: function (data) {
        switch (data) {
            case "server1" :
                collection.getDatabaseList(app.dataBaseUriLocal);
                break;
            case "server2" :
                collection.getDatabaseList(app.dataBaseUriRemote);
                break;
            case "server3" :
                rssiData = staticData
                loadLocations(staticData)
                break;
        }
    },
    loadLocations: function (data) {
        var locations =
        $.each(data, function (i, field) {
            locations.push(field)
        })

//    floorMapper(locations)
    }
}


/*
 * Extract the locations from Data and load it onto floor plan
 * */
function loadLocations(data) {
    var locations = []
    $.each(data, function (i, field) {
        locations.push(field)
    })

//    floorMapper(locations)
}


/*
 * Load list of Access Points
 * */
function loadAccessPoints(data) {
    clearAccesspointList();
    createAccesspointListUI();
    getNodeData(data);

    var nodeLabel = data
    $.each(rssiData, function (i, field) {
        if (field.location.node_label == nodeLabel) {

            var rssi = field.rawRSSI

            if ('latency' in field) {
                updateFloorInfoUi({scan: rssi.length, latency: field.latency})
            } else {
                updateFloorInfoUi({scan: rssi.length, latency: 'Unknown'})
            }

            var rssiDataGrouped = _.groupBy(rssi, function (run) {
                return run.sender_ssid + '_' + run.sender_bssid
            })

            var rssiDataArrayed = [];

            $.each(rssiDataGrouped, function (i, field) {
                rssiDataArrayed.push({ssid: i, data: field})
            })

            ssidData = _.sortBy(rssiDataArrayed, function (d) {
                return d.ssid.toLowerCase()
            })

            $.each(ssidData, function (i, field) {
                var template = '<li class="ui-widget-content" value=' + field.ssid + '>' + field.ssid + '</li>'
                $('#accesspointList').append(template)
            })

            $("#accesspointList").on("selectableselected", function (event, ui) {
                var ssid = ui.selected.getAttribute("value")
                $.each(ssidData, function (i, field) {
                    if (field.ssid == ssid) {
                        processRssiData(field.data)
                    }
                })
            })

        }
    })

}
/*
 * Retrieve the node data
 * */
function getNodeData(data) {
    $.each(locationData, function (i, field) {
        if (field.node_label == data) {
            nodeData = field
        }
    })
}


/*
 * Process the data to input into the chart.JS
 * */
function processRssiData(data) {
    selectedSsidData = data
    graphData = _.map(selectedSsidData, function (d) {
        return d.rssi
    })
    drawGraph(graphData)
}


function statistic(a) {
    var r = {mean: 0, variance: 0, deviation: 0}, t = a.length;
    for (var m, s = 0, l = t; l--; s += a[l]);
    for (m = r.mean = s / t, l = t, s = 0; l--; s += Math.pow(a[l] - m, 2));
    return r.deviation = Math.sqrt(r.variance = s / t), r;
}












