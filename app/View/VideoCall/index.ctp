<?php echo $this->Html->css('video_call')?>
<div id="chatroom-container">
	<div id="chatroom">
		<div id="side">
			<div id="my-webcam-container">
				<video id="my-webcam" muted="true" autoplay></video>
			</div>
			<div id="remaining-time-container">
				<span id="remaining-time">
					Remaining time : 05:00
				</span>
				<a href="#" class="btn-end-chat btn btn-danger btn-xs pull-right">End chat</a>
			</div>
		</div>
		<div id="partner-webcam-container">
			<center> <video id="partner-webcam" autoplay></video> </center>
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