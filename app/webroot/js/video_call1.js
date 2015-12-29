var timer;
var end;
function setMyVideo() {
	var has_displayed = typeof $("#my-webcam").attr('src') != 'undefined' ? true : false;
	if(!has_displayed) {
    $('#my-webcam').prop('src', URL.createObjectURL(stream));
    console.warn('connected to video');
  }
}

function displayErrorMedia(error) {
	console.warn(error);
}

function setPartnerVideo() {
	var enable = localStorage.enable_video;
	var stream = window.existingCall.remoteStream;
	if(enable){
		$('#partner-webcam').prop('src', URL.createObjectURL(stream));
		$('#my-webcam').prop('src', URL.createObjectURL(localStream));
	}else{
		$('#partner-webcam').removeAttr('src');
		$('#my-webcam').removeAttr('src');
	}
}

function startTime() {

}

function timerInterval() {

}