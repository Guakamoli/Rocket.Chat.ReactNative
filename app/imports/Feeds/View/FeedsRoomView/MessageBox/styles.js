import { StyleSheet } from 'react-native';

import { isIOS } from '../../../../../utils/deviceInfo';
import sharedStyles from '../../../../../views/Styles';

const MENTION_HEIGHT = 50;
const SCROLLVIEW_MENTION_HEIGHT = 4 * MENTION_HEIGHT;

export default StyleSheet.create({
	composer: {
		flexDirection: 'column',
		paddingVertical: 10,
		paddingTop: 20,
		backgroundColor: "white"
	},
	textArea: {
		flexDirection: 'row',
		alignItems: 'center',
		flexGrow: 0
	},
	boxWrapper: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 12
	},
	avatarBottom: {
		width: 45,
		height: 45,
		borderRadius: 45,
		marginRight: 8,
	},
	textBoxInput: {
		textAlignVertical: 'center',
		maxHeight: 240,
		flex: 1,

		// paddingVertical: 12, needs to be paddingTop/paddingBottom because of iOS/Android's TextInput differences on rendering
		paddingTop: 12,
		paddingBottom: 12,
		paddingLeft: 0,
		paddingRight: 0,
		fontSize: 16,
		letterSpacing: 0,
		...sharedStyles.textRegular
	},
	textBoxInputWrapper: {
		paddingHorizontal: 20,
		paddingRight: 0,
		borderWidth: 1,
		flex: 1,
		borderColor: "#DBDBDBFF",
		borderRadius: 23,
		backgroundColor: "white",
		flexDirection: "row"
	},
	actionButton: {
		alignItems: 'center',
		justifyContent: 'center',
		width: 60,
		height: 48
	},
	mentionList: {
		maxHeight: MENTION_HEIGHT * 4
	},
	mentionItem: {
		height: MENTION_HEIGHT,
		borderTopWidth: StyleSheet.hairlineWidth,
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 5
	},
	mentionItemCustomEmoji: {
		margin: 8,
		width: 30,
		height: 30
	},
	mentionItemEmoji: {
		width: 46,
		height: 36,
		fontSize: isIOS ? 30 : 25,
		...sharedStyles.textAlignCenter
	},
	fixedMentionAvatar: {
		width: 46,
		fontSize: 14,
		...sharedStyles.textBold,
		...sharedStyles.textAlignCenter
	},
	mentionText: {
		fontSize: 14,
		...sharedStyles.textRegular
	},
	emojiKeyboardContainer: {
		flex: 1,
		borderTopWidth: StyleSheet.hairlineWidth
	},
	slash: {
		height: 30,
		width: 30,
		padding: 5,
		paddingHorizontal: 12,
		marginHorizontal: 10,
		borderRadius: 2
	},
	commandPreviewImage: {
		justifyContent: 'center',
		margin: 3,
		width: 120,
		height: 80,
		borderRadius: 4
	},
	commandPreview: {
		height: 100,
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center'
	},
	avatar: {
		margin: 8
	},
	scrollViewMention: {
		maxHeight: SCROLLVIEW_MENTION_HEIGHT
	},
	recordingContent: {
		flexDirection: 'row',
		flex: 1,
		justifyContent: 'space-between'
	},
	recordingCancelText: {
		fontSize: 16,
		...sharedStyles.textRegular
	},
	buttonsWhitespace: {
		width: 15
	},
	sendToChannelButton: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 8,
		paddingHorizontal: 18
	},

});
