<style>
#table-history {
	width: 1000px;
	margin: 10px auto;
}
thead {
	background: #ddd;
}
th,td {
	text-align: center;
}
</style>
<center> <h1> Chat History </h1> </center>
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
			<td> <?php echo $row['Sender']['name']?> </td>
			<td> <?php echo $row['Recipient']['name']?> </td>
		</tr>
	<?php endforeach; ?>
	</tbody>
</table>
<?php echo $this->element('paginator'); ?>