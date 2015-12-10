<script>
var my_id = "<?php echo $my_id?>";
var my_name = "<?php echo $my_name?>";
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
			<div id="members">
				<div id="member-list"></div>
				<div>
					<a href="#" class="btn btn-primary btn-sm btn-video-chat">Video Chat</a>
					<input type="submit" value="Leave" class="btn btn-danger btn-sm btn-leave">
				</div>
			</div>
		</div>
		<div id="chatbox-container">
			<div id="conversations">
			</div>
			<div id="chatbox-input">
				<?php echo $this->Form->create('Conversation',array('id'=>'message-form'));?>
				<input type="submit" value="Send" class="btn btn-primary" id="send">
				<textarea class="form-control" id="txt-message"> </textarea>
			</div>
		</div>
	</div>
</div>