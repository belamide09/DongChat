<style>
#table-history {
	width: 1000px;
	margin: 50px auto;
}
th,td {
	text-align: center;
}
</style>
<table class="table table-bordered" id="table-history">
	<thead>
		<tr>
			<th> # </th>
			<th> Chathash </th>
			<th> Started </td>
			<th> End </th>
			<th> Sender </th>
			<th> Recipient </th>
		</tr>
	</thead>
	<tbody>
	<?php foreach($data as $row):?>
		<tr>
			<td> <?php echo $row['ChatHistory']['id']?> </td>
			<td> <?php echo $row['ChatHistory']['chat_hash']?> </td>
			<td> <?php echo $row['ChatHistory']['started']?> </td>
			<td> <?php echo $row['ChatHistory']['end'] ? $row['ChatHistory']['end'] : '--'?> </td>
			<td> <?php echo $row['Sender']['firstname'].' '.$row['Sender']['lastname']?> </td>
			<td> <?php echo $row['Recipient']['firstname'].' '.$row['Recipient']['lastname']?> </td>
		</tr>
	<?php endforeach; ?>
	</tbody>
</table>
<?php echo $this->element('paginator'); ?>