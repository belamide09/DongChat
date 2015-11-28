<script> var my_id = "<?php echo $my_id; ?>"; </script>
<?php echo $this->Html->css('mainroom')?>
<?php echo $this->Html->script('peer')?>
<?php echo $this->Html->script('mainroom')?>
<?php echo $this->Html->script('mainroom_node')?>
<div id="chatroom-container">
	<div id="chatroom">
		<div id="side">
			<div id="my-webcam-container">
				<video id="my-webcam" muted="true" autoplay></video>
			</div>
			<div id="rooms">
				<legend> <center> Room List </center> </legend>
				<div id="room-list">
				</div>
				<div class="create-room">
					<button class="btn btn-primary btn-xs btn-new-room"> Create </button>
					<?php echo $this->Form->text('Room',array('class'=>'form-control txt-room-name','placeholder'=>'Enter room name'))?>
				</div>
			</div>
		</div>
		<div id="chatbox-contaner">
			<div id="conversations">
			</div>
			<div id="chatbox-input">
				<?php echo $this->Form->create('Conversation');?>
				<input type="submit" class="btn btn-primary" id="send">
				<textarea class="form-control"> </textarea>
			</div>
		</div>
	</div>
</div>