<script> 
var my_id = "<?php echo $my_id?>";
var room_id = "<?php echo $room_id?>";
</script>
<?php echo $this->Html->script('peer')?>
<?php echo $this->Html->css('chatroom')?>
<?php echo $this->Html->script('chatroom')?>
<?php echo $this->Html->script('chatroom_node')?>
<div id="chatroom-container">
	<div id="chatroom">
		<div id="side">
			<div id="my-webcam-container">
				<video id="my-webcam" muted="true" autoplay></video>
			</div>
			<div id="remaining-time"> Time Remaining : 05:00 </div>
			<div id="members">
				<div id="member-list"></div>
				<div> <input type="submit" value="Leave" class="btn btn-danger btn-sm btn-leave"></div>
			</div>
		</div>
		<div id="partner-webcam-container">
		<video id="partner-webcam" autoplay></video>
		</div>
		<div id="chatbox-contaner">
			<div id="conversations">
			</div>
			<div id="chatbox-input">
				<?php echo $this->Form->create('Conversation');?>
				<input type="submit" value="Send" class="btn btn-primary" id="send">
				<textarea class="form-control"> </textarea>
			</div>
		</div>
	</div>
</div>