<script>
var my_id = "<?php echo $my_id?>";
var my_name = "<?php echo $my_name?>";
var room_id = "<?php echo $room_id?>";
</script>
<?php echo $this->Html->script('peer')?>
<?php echo $this->Html->css('video_call')?>
<?php echo $this->Html->script('video_call')?>
<?php echo $this->Html->script('video_call_node')?>
<div id="chatroom-container">
	<div id="chatroom">
		<div id="side">
			<div id="my-webcam-container">
				<video id="my-webcam" muted="true" autoplay></video>
			</div>
			<div id="remaining-time-container">
				<span id="remaining-time">
				</span>
				<a href="#" class="btn-end-chat btn btn-danger btn-xs pull-right">End chat</a>
			</div>
			<div id="members">
				<div id="member-list"></div>
				<div>
					<a href="#" class="btn btn-success btn-sm pull-right btn-back">Go back to chatroom</a>
					<input type="submit" value="Leave" class="btn btn-danger btn-sm btn-leave">
				</div>
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
				<textarea class="form-control" id="txt-message"> </textarea>
			</div>
		</div>
	</div>
</div>