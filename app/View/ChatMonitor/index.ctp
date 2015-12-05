<style>
#table-history {
	width: 1000px;
	margin: 0px auto;
}
.notification {
	width: 1000px;
	margin: 10px auto;
	display: none;
}
thead {
	background: #ddd;
}
th,td {
	text-align: center;
}
</style>
<center> <h2> Chat Monitor </h2> </center>
<div class="notification"> 
	<div class="alert alert-success">
	  New chat has been created, Refresh to view it.
	</div>
</div>
<table class="table table-bordered" id="table-history">
	<thead>
		<tr>
			<th> # </th>
			<th> Chathash </th>
			<th> Started </td>
			<th> Sender </th>
			<th> Recipient </th>
			<th> Action </th>
		</tr>
	</thead>
	<tbody>
<?php if ($data):?>
	<?php foreach($data as $row):?>
		<?php $chat_id = $row['ChatHistory']['id']?>
		<?php $chat_hash = $row['ChatHistory']['chat_hash']?>
		<?php $sender_id = $row['ChatHistory']['sender_id']?>
		<?php $recipient_id = $row['ChatHistory']['recipient_id']?>
		<tr class="<?php echo $chat_hash?>">
			<td> <?php echo $row['ChatHistory']['id']?> </td>
			<td> <?php echo $row['ChatHistory']['chat_hash']?> </td>
			<td> <?php echo $row['ChatHistory']['started']?> </td>
			<td> <?php echo $row['Sender']['firstname'].' '.$row['Sender']['lastname']?> </td>
			<td> <?php echo $row['Recipient']['firstname'].' '.$row['Recipient']['lastname']?> </td>
			<td>
				<a href="#" class="btn btn-danger btn-xs btn-kill" chat-id="<?php echo $chat_id?>" 
					 sender-id="<?php echo $sender_id?>" recipient-id="<?php echo $recipient_id?>" 
					 chat-hash="<?php echo $chat_hash?>">
					Kill<i class="fa fa-stop"></i>
				</a>
			</td>
		</tr>
	<?php endforeach; ?>
<?php else: ?>
		<tr>
			<td colspan="6"> No Active Chat Found... </td>
		</tr>
<?php endif; ?>
	</tbody>
</table>
<?php echo $this->element('paginator'); ?>
<script>
$(document).ready(function() {
	var socket = io.connect('http://192.168.0.187:3000');
	$(".btn-kill").click(function() {
		var confirmation = confirm('Are you sure you want to kill this chat?');
		if ( confirmation == true ) {
			var chat_id = $(this).attr('chat-id');
			var chat_hash = $(this).attr('chat-hash');
			var sender_id = $(this).attr('sender-id');
			var recipient_id = $(this).attr('recipient-id');
			socket.emit('kill_chat',{chat_id:chat_id,chat_hash:chat_hash,sender_id:sender_id,recipient_id:recipient_id});
		}
		return false;
	})
	socket.on('notify_new_chat',function(){ 
		$(".notification").fadeIn(1000, function() {
			$(this).fadeOut(1500);
		});
	});
	socket.on('remove_chat',function(data) {
		$("."+data['chat_hash']).fadeOut();
	})
})
</script>