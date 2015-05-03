var caretakerUsername = "#{user.username}";
function formatAlert(alert){
    var alertEntry = document.createElement('li');
    alertEntry.setAttribute("class","list-group-item");
        //create elder name row
        var elderRow = document.createElement('div');
        elderRow.setAttribute("class", "row alert-entry-row");
        //create header with elder name
            var elderHeading = document.createElement('h4');
            elderHeading.setAttribute("class", "boldText");
            var alertIcon = document.createElement('span');
            alertIcon.setAttribute("class", "glyphicon glyphicon-exclamation-sign glyph-padd");
            elderHeading.appendChild(alertIcon);
            //create and append text
            var elderName = document.createTextNode("Alert for: "+ alert.elder);
            elderHeading.appendChild(elderName);
        //append header to elder name row, then append to list entry
        elderRow.appendChild(elderHeading);
        alertEntry.appendChild(elderRow);
        //create time row
        var alertTimeRow = document.createElement('div');
        alertTimeRow.setAttribute("class", "row alert-entry-row");
        //create header with elder name
            var timeHeading = document.createElement('h4');
            var alertTimeIcon = document.createElement('span');
            alertTimeIcon.setAttribute("class", "glyphicon glyphicon-time glyph-padd");
            timeHeading.appendChild(alertTimeIcon);
            //create and append text
            var alertTimeStr = new Date(alert.createdAt).toLocaleTimeString();
            var alertTime = document.createTextNode("As of: " + alertTimeStr);
            timeHeading.appendChild(alertTime);
        //append header to elder name row, then append to list entry
        alertTimeRow.appendChild(timeHeading);
        alertEntry.appendChild(alertTimeRow);                
        //create message row
        var alertMessageRow = document.createElement('div');
        alertMessageRow.setAttribute("class", "row alert-entry-row");
        //create header with elder name
            var messageHeading = document.createElement('h4');
            //create and append text
            var alertMessage = document.createTextNode(alert.message);
            messageHeading.appendChild(alertMessage);
        //append header to elder name row, then append to list entry
        alertMessageRow.appendChild(messageHeading);
        alertEntry.appendChild(alertMessageRow);
    return alertEntry;
};
var getOngoingAlerts = function(username){
    console.log('HERE')
    $.get(caretakerUsername+'/getOngoingAlerts/', function(data){
        var ongoingAlertList = document.getElementById('ongoingAlerts');
        for (var a = 0; a < data.length; a++){
            var alert = data[a];
            // console.log(alert)
            var alertId = alert.objectId;
            var alertListEntry = formatAlert(alert);
            var dismissForm = document.createElement('form');
            dismissForm.setAttribute("method", "post");
            var dismiss_btn = document.createElement('button');
            dismiss_btn.setAttribute("class", "btn btn-default btn-primary btn-block btn-red");
            dismiss_btn.setAttribute('type', 'submit');
            dismiss_btn.setAttribute('formaction', caretakerUsername+'/dismissAlert/'+alertId);
            var dismissBtnText = document.createTextNode("Dismiss Alert");
            dismiss_btn.appendChild(dismissBtnText);
            alertListEntry.appendChild(dismiss_btn);
            dismissForm.appendChild(alertListEntry)
            ongoingAlertList.appendChild(dismissForm);
        }
    });
    setTimeout('getOngoingAlerts()',3000)
};
var getDismissedAlerts = function(username){
    console.log("HERE")
    $.get(username+'/getDismissedAlerts/', function(data){
        var ongoingAlertList = document.getElementById('dismissedAlerts');
        for (var a = 0; a < data.length; a++){
            var alert = data[a];
            var alertListEntry = formatAlert(alert);
            ongoingAlertList.appendChild(alertListEntry);
        }
    });
    setTimeout('getDismissedAlerts()',3000) 
}
$(document).ready(function(){
    console.log("HERE")
    // getOngoingAlerts();
    // getDismissedAlerts();
})