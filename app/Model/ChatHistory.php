<?php
class ChatHistory extends AppModel {
	public $belongsTo = array(
		'Sender' => array(
			'fields' => array(
				'Sender.id',
				'Sender.name'
			),
			'className' => 'User',
			'foreignKey' => false,
			'conditions' => array(
				'ChatHistory.sender_id = Sender.id'
			)
		),
		'Recipient' => array(
			'fields' => array(
				'Recipient.id',
				'Recipient.name'
			),
			'className' => 'User',
			'foreignKey' => false,
			'conditions' => array(
				'ChatHistory.recipient_id = Recipient.id'
			)
		)
	);
}