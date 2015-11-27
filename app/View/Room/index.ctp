<?php echo $this->Html->script('peer')?>
<?php echo $this->Html->script('chatroom')?>
<div id="chatroom-container">
	<div id="chatroom">
		<div id="side">
			<div id="my-webcam-container">
				<video id="my-webcam" muted="true" autoplay></video>
			</div>
			<div id="people"></div>
		</div>
		<div id="partner-webcam">

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