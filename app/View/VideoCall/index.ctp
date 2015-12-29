<script>
var room_id = "<?php echo $room_id?>";
var partner_type = "<?php echo $partner_type?>";
var partner_id = "<?php echo $partner_id?>";
var partner_name = "<?php echo $partner_name?>";
var my_id = "<?php echo $my_id?>";
var my_name = "<?php echo $my_name?>";
var disabled_video = <?php echo $disabled_video?>;
</script>
<?php echo $this->Html->script('peer.min')?>
<?php echo $this->Html->css('video_call')?>
<?php echo $this->Html->script('room')?>
<?php echo $this->Html->script('room_emit')?>
<?php //echo $this->Html->script('video_call')?>
<?php //echo $this->Html->script('video_call_node')?>
<div id="header">
	<a class="btn btn-sm btn-leave disable" rel="modal" href="#dialog_logout">LEAVE</a>
	<div id="remaining-time-container">
		<span class="cnt_time" id="remaining-time">--:--</span>
		<a href="#" class="btn btn-default btn-xs btn-start-chat <?php echo empty($partner_id) ? 'disabled' : 'onn'?>" title="Start chat" <?php if (empty($partner_id)) echo ' disabled'?>>
			<div></div>
		</a>
	</div>
</div>
<div id="chatroom-container">
	<div id="chatroom">
		<div id="side">
			<div id="my-webcam-container">
				<center> <video id="my-webcam" muted="true" autoplay></video> </center>
			</div>
			<div id="buttons">
				<a href="#" class="btn btn-default btn-xs btn-disable-video <?php echo $disabled_video ? 'off' : 'onn'?>" disable-video="<?php echo $disabled_video?>">
					<div></div>
				</a>
				<a href="#" class="btn btn-default btn-xs btn-sound-control off">
					<div></div>
				</a>
				<a href="#" class="btn btn-default btn-xs btn-resolution-control onn">
					<div class="btn-resolution"></div>
				</a>
				<a href="#" class="btn btn-default btn-xs btn-bitrate-control onn">
					<div class="btn-bitrate"></div>
				</a>
				<ul id="resolution-list" style="display:none;">
					<li data-value="140">140</li>
					<li data-value="240">240</li>
					<li data-value="360" class="selected">360</li>
					<li data-value="480">640</li>
				</ul>
				<div id="bit-rate-range" style="display:none;"></div>
			</div>
		</div>
		<div id="partner-webcam-container">
			<center> <video id="partner-webcam" height="100%" width="100%" autoplay></video> </center>
		</div>
		<div id="chatbox-container">
			<div id="conversations">
				<div class="reconnecting"><img src="img/loading.gif"> Reconnecting </div>
			</div>
			<div id="chatbox-input">
				<input type="submit" value="Send" class="btn btn-primary" id="send">
				<input type="text" class="form-control" id="txt-message">
			</div>
		</div>
	</div>
</div>

<script>
$(function() {
	var webcam_height_orig = parseInt($("#partner-webcam-container").css('height'));
	var chatbox_height_orig = parseInt($("#chatbox-container").css('height'));
	var conversations_height_orig = parseInt($("#conversations").css('height'));
	// Resizable video
	$( "#partner-webcam-container" ).resizable({
		handles: 's',
		minHeight: 200,
	  maxHeight: 550
	});
	// Adjust video size and chatbox when partner webcam container resize
	$( "#partner-webcam-container" ).resize(function() {
		$("#partner-webcam").css('height',$(this).css('height'));
		var diff = parseInt($(this).css('height')) - webcam_height_orig;
		var chatbox_height =  chatbox_height_orig - diff;
		var conversation_height = conversations_height_orig - diff;
		$("#chatbox-container").css('height',chatbox_height+'px');
		$("#conversations").css('height',conversation_height+'px');
	})
});
</script>
<script>
var timer;
var end;
var myEmit = new RoomEmit();
var myRoom = new Room();
function setMyVideo() {
	var has_displayed = typeof $("#my-webcam").attr('src') != 'undefined' ? true : false;
	var stream = window.localStream;
	if(!has_displayed) {
    $('#my-webcam').prop('src', URL.createObjectURL(stream));
    console.warn('connected to video');
  }
}
function StartCall(peer_id) {
	$(".btn-start-chat").attr('disabled','disabled');
  $(".btn-start-chat").addClass('disable');
	myRoom.call(peer_id)
	myRoom.save_chat();
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
function SendMessage() {
  var msg = $("#txt-message").val();
  $("#txt-message").val("");
  $("#txt-message")[0].focus();
  if (msg.trim()){
    var message = '<div class="message">'+my_name+' : '+msg+'</div>';
    $("#conversations .reconnecting").after(message);
    myRoom.sendMessage(msg);
  }
}
function ReceiveMessage(data) {
	var message = '<div class="message">'+data['sender']+' : '+data['msg']+'</div>';
  $("#conversations .reconnecting").after(message);
}
function reconnectPartner() {
	console.warn( 'reconnect!' );
  $("#conversations .reconnecting").after('<div class="message">Server: '+partner_name+' is now connected to the chat</div>');
	$(".btn-end-chat").show();
}
function NotifyDisconnectPartner() {
  var message = '<div class="message">Server: <span style="color:blue;">'+partner_name+' may also reconnect from this chat so please wait for a while</span></div>';
  message += '<div class="message">Server: <span style="color:red;">'+partner_name+' has been disconnected... Please wait until the time finish</span></div>';
  $("#conversations .reconnecting").after(message);
}
function enableStart(t) {
	if(t){
		$(".btn-start-chat").removeAttr('disabled');
		$(".btn-start-chat").removeClass('disable');
	}else{
	  $(".btn-start-chat").attr('disabled','disabled');
	  $(".btn-start-chat").addClass('disable');
	}
}
function setRemainingTime(sec) {
	var time = convertTime(sec);
	if ( sec <= 0 ) {
    $("#remaining-time").text('--:--');
  } else {
    $("#remaining-time").text(time);
  }
}
function convertTime(time) {
  var minutes = Math.floor(time / 60);
  var seconds = time % 60;
  if ( minutes < 10 ) {
    minutes = '0'+minutes;
  }
  if ( seconds < 10 ) {
    seconds = '0'+seconds;
  }
  return minutes+":"+seconds;
}
function endChat() {
	$("#conversations").html('<div class="reconnecting"><img src="img/loading.gif"> Reconnecting </div>');
  $(".btn-end-chat").hide();
  $("#remaining-time").text('--:--');
  $(".btn-start-chat").removeAttr('disabled');
  $(".btn-start-chat").removeClass('disable');
  $("#partner-webcam").attr('src',null);
}
$(function() {
	$(".btn-disable-video").on('click',function() {
		var enable = $(this).attr('disable-video') == 0 ? true : false;
		Room.enable_video(enable);
	});
	$(".btn-start-chat").on('click',function() {
		var url = 'VideoCall/getPartnerPeer';
		$.post(url,{user_id:partner_id,room_id:room_id},function(data) {
			if(data['peer']){
				StartCall(data['peer']);
			}
		},'JSON');
	})
	$("#txt-message").keypress(function(e) {
		if(e.keyCode == 13)SendMessage();
	});
	$("#send").click(SendMessage);
  $(".btn-leave").click(function() {
  	myRoom.leaveRoom();
	});
});
</script>